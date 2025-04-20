'use client';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
        Welcome to Life Manage
      </h1>
      <p className="text-xl text-center text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
        Organize your ChatGPT conversations into actionable projects
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
        >
          Go to Dashboard
        </a>
        <a
          href="/upload"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg text-center transition-colors"
        >
          Upload ChatGPT History
        </a>
      </div>
    </div>
  );
}
