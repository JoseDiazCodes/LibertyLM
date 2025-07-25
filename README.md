# Codebase Analyzer & AI Chat

A powerful web application that helps developers understand and analyze codebases through AI-powered conversations and visual architecture diagrams.

## 🚀 Features

- **📁 File Upload & Analysis**: Upload your codebase files and get intelligent analysis
- **🤖 AI-Powered Chat**: Ask questions about your code using OpenAI, Claude, or Google AI
- **📊 Visual Architecture Diagrams**: Generate Mermaid diagrams showing your codebase structure
- **💾 Session Management**: Save and revisit your analysis sessions
- **🔑 API Key Management**: Securely store your AI API keys locally
- **💡 Sample Questions**: Pre-built questions to get you started
- **🎨 Modern UI**: Beautiful, responsive interface with dark/light mode support
- **🔐 User Authentication**: Secure user accounts with Supabase Auth

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **AI Integration**: OpenAI GPT, Claude, Google AI APIs
- **Charts & Diagrams**: Mermaid, Recharts
- **File Handling**: Multi-format file upload support

## 📋 Prerequisites

- Node.js 18+ or Bun
- A Supabase account
- At least one AI API key (OpenAI, Claude, or Google AI)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using bun:
```bash
bun install
```

### 3. Set Up Supabase

This project is already configured with Supabase. The database schema will be automatically set up when you run the application.

**Supabase Project Details:**
- Project ID: `zmraqlletezeirljsmhp`
- The application is pre-configured to work with the existing Supabase setup

### 4. Configure AI API Keys

The application supports multiple AI providers. You have two options:

#### Option A: User-Provided Keys (Recommended)
Users can add their own API keys through the Settings tab in the application. Keys are stored locally in the browser for privacy.

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Claude**: Get your API key from [Anthropic Console](https://console.anthropic.com/account/keys)
- **Google AI**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

#### Option B: Server-Side Keys
Configure API keys in Supabase Edge Function secrets for all users to share. Add these secrets in your Supabase dashboard:

- `OPENAI_API_KEY`
- `CLAUDE_API_KEY`
- `GOOGLE_AI_API_KEY`

### 5. Run the Application

```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Supabase Setup

The project uses Supabase for:
- User authentication (with anonymous access support)
- Database (chat sessions, messages, uploaded files)
- File storage
- Edge functions for AI processing

The database includes these main tables:
- `chat_sessions`: User chat sessions
- `chat_messages`: Individual messages in sessions
- `uploaded_files`: Metadata for uploaded codebase files

### Edge Functions

The project includes a Supabase Edge Function (`analyze-codebase`) that:
- Processes uploaded files
- Generates architecture diagrams using AI
- Supports multiple AI providers with fallback logic

## 📖 Usage

### 1. Authentication
- Sign up or log in using the authentication button
- Anonymous/guest mode is available for quick testing
- User data is isolated and secure with Row Level Security (RLS)

### 2. Upload Files
- Use the file upload area to add your codebase files
- Supported formats: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cpp`, and more
- Files are stored securely and associated with your session

### 3. Ask Questions
- Use the sample questions or ask your own
- Example questions:
  - "How does authentication work in this system?"
  - "What does this architecture diagram show?"
  - "Explain the main components and their relationships"
  - "What are the key dependencies?"

### 4. Generate Visual Diagrams
- Switch to the "Visual" tab
- Click "Generate Architecture Diagram" to create a Mermaid diagram
- The diagram shows component relationships and data flow
- Requires at least one AI API key to be configured

### 5. Manage Sessions
- View your chat history in the "History" tab
- Switch between different analysis sessions
- Sessions are automatically saved and restored

### 6. API Key Management
- Go to the "Settings" tab to manage your API keys
- Add keys for OpenAI, Claude, or Google AI
- Keys are stored locally for privacy and security

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── ApiKeyManager.tsx # API key management
│   ├── ChatWindow.tsx   # Main chat interface
│   ├── FileUpload.tsx   # File upload component
│   ├── VisualPlayground.tsx # Architecture diagram generator
│   ├── SampleQuestions.tsx  # Pre-built questions
│   └── ...
├── pages/               # Main pages
│   └── Index.tsx        # Main application page
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── integrations/        # Supabase integration
│   └── supabase/        # Supabase client and types
└── assets/             # Static assets

supabase/
├── functions/          # Edge functions
│   └── analyze-codebase/ # AI analysis function
├── migrations/         # Database migrations
└── config.toml         # Supabase configuration
```

## 🚀 Deployment

### Deploy with Lovable (Recommended)

1. Open [Lovable Project](https://lovable.dev/projects/d49894dd-8b23-4894-a748-1cc85ee6610f)
2. Click Share → Publish
3. Your app will be deployed automatically

### Deploy to Other Platforms

The frontend can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo
- **Netlify**: Connect your GitHub repo  
- **Custom Domain**: Configure in Project > Settings > Domains

The Supabase backend (database, auth, edge functions) is already hosted and configured.

## 🔑 API Keys & Security

### Privacy & Security
- User API keys are stored locally in browser localStorage
- No API keys are sent to the application servers
- All database access is protected with Row Level Security (RLS)
- Users can only access their own data

### Supported AI Models
- **OpenAI**: GPT-4.1-2025-04-14, GPT-4.1-mini-2025-04-14
- **Claude**: claude-sonnet-4-20250514, claude-opus-4-20250514
- **Google AI**: Gemini models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test locally: `npm run dev`
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature-name`
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing UI component library (shadcn/ui)
- Maintain responsive design principles
- Test with different AI providers
- Follow the existing code structure

## 🐛 Troubleshooting

### Common Issues

**API Keys Not Working**
- Ensure keys are added in the Settings tab
- Check that keys have sufficient credits/quota
- Verify key format matches the provider's requirements

**File Upload Issues**
- Check file size limits
- Ensure supported file formats
- Verify user authentication status

**Visual Diagrams Not Generating**
- Confirm at least one AI API key is configured
- Check that files have been uploaded to provide context
- Monitor browser console for errors

### Getting Help
- Check the [Lovable Documentation](https://docs.lovable.dev/)
- Create an issue in this repository
- Join the [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)

## 📝 License

This project is open source and available under the MIT License.

## 🔮 Roadmap

- [ ] Support for more programming languages
- [ ] Advanced code analysis features
- [ ] Integration with more AI providers
- [ ] Real-time collaboration features
- [ ] Plugin system for custom analyzers
- [ ] Export functionality for diagrams and reports
- [ ] Integration with Git repositories
- [ ] Code quality metrics and suggestions

---

Built with ❤️ using React, TypeScript, Supabase, and AI

**Lovable Project**: [https://lovable.dev/projects/d49894dd-8b23-4894-a748-1cc85ee6610f](https://lovable.dev/projects/d49894dd-8b23-4894-a748-1cc85ee6610f)
