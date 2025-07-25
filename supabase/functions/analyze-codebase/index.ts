import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert software architect who creates clear, comprehensive Mermaid diagrams for codebase analysis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const mermaidCode = data.choices[0].message.content.trim();

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