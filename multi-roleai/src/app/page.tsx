import Image from "next/image";

export default function Home() {
  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-12">
          Multi-RoleAI
        </h1>
        <p className="text-xl text-center max-w-2xl mb-4">
          Your advanced AI assistant platform with multi-modal capabilities and powerful workspaces
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <a
            className="rounded-full transition-colors flex items-center justify-center bg-accentBlue text-white gap-2 hover:bg-accentBlue/90 font-medium text-sm sm:text-base h-12 px-6 w-full sm:w-auto"
            href="/api/auth/signin"
          >
            Get Started
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6 w-full sm:w-auto"
            href="/api/auth/signin"
          >
            Sign In
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Advanced AI Tasks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Create complex tasks and let AI agents handle them efficiently
            </p>
          </div>
          <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Multi-Modal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Process text, images, documents, and visualize data with powerful AI tools
            </p>
          </div>
          <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Secure & Scalable</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enterprise-grade security with role-based access control and content filtering
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
