import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    
    return(
<footer className="border-t border-border bg-background flex items-center px-8 h-16">
<div className="max-w-6xl mx-auto w-full flex items-center justify-between">
  <div className="flex items-center gap-3 text-sm text-muted-foreground">
    <span>© 2025 Web-algoholics</span>
  </div>
  <div className="flex items-center gap-6 text-sm text-muted-foreground">
    <Link to="/help" className="hover:text-foreground transition-colors">О проекте</Link>
    <Link to="/help" className="hover:text-foreground transition-colors">Вопросы и ответы</Link>
    <Link to="/help" className="hover:text-foreground transition-colors">Обратная связь</Link>
  </div>
</div>
</footer>
    );
}