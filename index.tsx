import React from 'react';
import ReactDOM from 'react-dom/client';
import { supabaseError } from './services/supabaseClient';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const ConfigurationError = () => (
  <div className="fixed inset-0 bg-red-50 text-red-800 flex flex-col justify-center items-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full text-center border-4 border-red-200">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Configuration Error</h1>
      <p className="text-lg text-gray-700 leading-relaxed">{supabaseError}</p>
      <div className="mt-6 text-left bg-gray-50 p-4 rounded-md border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-2">How to Fix:</h2>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
            <li>Go to your project on <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">supabase.com</a>.</li>
            <li>Navigate to <strong className="font-mono bg-gray-200 py-1 px-1.5 rounded text-xs">Project Settings &gt; API</strong>.</li>
            <li>Copy your <strong>Project URL</strong> and <strong>anon public key</strong>.</li>
            <li>Paste them into the <code>services/supabaseClient.ts</code> file in your project code.</li>
        </ol>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        This is a required step to connect the application to your database. Once you've added the credentials, please refresh this page.
      </p>
    </div>
  </div>
);

async function main() {
  if (supabaseError) {
    root.render(
      <React.StrictMode>
        <ConfigurationError />
      </React.StrictMode>
    );
  } else {
    // Dynamically import the main App component only when configuration is valid
    const App = (await import('./App')).default;
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

main();
