import React from "react";

export default function Footer() {
    return(
<footer className="bg-white border-t border-gray-200 mt-32">
<div className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-between">
  <div className="flex items-center gap-3 text-sm text-gray-600">
    <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-sm">
      📖
    </div>
    <span>© 2025 Learning Platform</span>
  </div>
  <div className="flex items-center gap-6 text-sm text-gray-600">
    <a href="#" className="hover:text-gray-900">Help Center</a>
    <a href="#" className="hover:text-gray-900">Privacy</a>
    <a href="#" className="hover:text-gray-900">Terms</a>
  </div>
</div>
</footer>
    );
}