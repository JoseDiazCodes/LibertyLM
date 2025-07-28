import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { sessionId, userApiKeys } = body;
    
    // Check for user-provided API keys or fallback to environment
    const openAIApiKey = userApiKeys?.openai || Deno.env.get('OPENAI_API_KEY');
    const claudeApiKey = userApiKeys?.claude || Deno.env.get('CLAUDE_API_KEY');
    
    // Verify at least one API key is available
    if (!openAIApiKey && !claudeApiKey) {
      console.error('No AI API keys found');
      return new Response(
        JSON.stringify({ 
          error: 'No AI API keys configured. Please add your API keys in the settings.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get files for the session
    const { data: files, error: filesError } = await supabase
      .from('uploaded_files')
      .select('file_name, file_type, storage_path')
      .eq('session_id', sessionId);

    if (filesError) {
      throw new Error(`Failed to fetch files: ${filesError.message}`);
    }

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files found for this session' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a summary of the codebase structure
    const fileStructure = files.map(file => ({
      name: file.file_name,
      type: file.file_type,
      extension: file.file_name.split('.').pop()
    }));

    // Analyze with OpenAI
    const prompt = `
You are a senior software architect analyzing a codebase. Based on the following file structure, create a comprehensive Mermaid diagram that shows:

1. The overall architecture and data flow
2. Component relationships and dependencies  
3. Main modules and their interactions
4. Database/storage connections if applicable

Files in the codebase:
${fileStructure.map(f => `- ${f.name} (${f.type})`).join('\n')}

Please generate a Mermaid diagram using flowchart syntax that clearly shows:
- Main components/modules
- Data flow between components
- External dependencies
- Database or API connections
- User interactions

Focus on creating a clear, comprehensive architecture diagram. Use appropriate Mermaid syntax (flowchart TD, graph LR, etc.) and include meaningful labels and relationships.

Return ONLY the Mermaid diagram code, no additional text or explanations.
`;

    let mermaidCode;

    // Try OpenAI first if available
    if (openAIApiKey) {
      console.log('Using OpenAI API...');
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are an expert software architect who creates clear, comprehensive Mermaid diagrams for codebase analysis.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          mermaidCode = data.choices[0].message.content.trim();
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      } catch (error) {
        console.error('OpenAI API failed:', error);
        if (!claudeApiKey) throw error;
      }
    }

    // Try Claude if OpenAI failed or is not available
    if (!mermaidCode && claudeApiKey) {
      console.log('Using Claude API...');
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${claudeApiKey}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: `You are an expert software architect who creates clear, comprehensive Mermaid diagrams for codebase analysis.\n\n${prompt}`
              }
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          mermaidCode = data.content[0].text.trim();
        } else {
          throw new Error(`Claude API error: ${response.status}`);
        }
      } catch (error) {
        console.error('Claude API failed:', error);
        throw error;
      }
    }

    if (!mermaidCode) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate diagram with available AI services' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ mermaidCode, fileCount: files.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-codebase function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});