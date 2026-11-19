export const PROMPT_TEMPLATES = [
  {
    id: 'code-opt',
    title: 'Code Optimizer',
    category: 'Development',
    icon: 'Zap',
    prompt: 'Review the following code and optimize it for maximum performance, minimal memory allocation, and algorithmic efficiency. Explain the time/space complexity before and after.',
  },
  {
    id: 'bug-hunt',
    title: 'Bug & Vulnerability Hunter',
    category: 'Security',
    icon: 'Bug',
    prompt: 'Analyze the following code for potential bugs, edge-case failures, unhandled exceptions, and security vulnerabilities (e.g., injection, race conditions, memory leaks). Provide fixes.',
  },
  {
    id: 'unit-tests',
    title: 'Unit Test Suite',
    category: 'Testing',
    icon: 'CheckCircle',
    prompt: 'Write a comprehensive suite of unit tests for the following code, covering happy paths, edge cases, boundary conditions, and mock external dependencies.',
  },
  {
    id: 'sys-design',
    title: 'System Architecture',
    category: 'Architecture',
    icon: 'Layers',
    prompt: 'Design a distributed, high-throughput system architecture for the following requirements. Cover data flow, caching strategy, database choices, load balancing, and failure modes.',
  },
  {
    id: 'eli5',
    title: 'ELI5 Explainer',
    category: 'Learning',
    icon: 'Sparkles',
    prompt: 'Explain the following complex concept simply, as if I am 5 years old. Use real-world intuitive analogies, avoid heavy jargon, and summarize in 3 bullet points.',
  },
  {
    id: 'groq-lpu',
    title: 'Groq LPU Acceleration',
    category: 'Groq',
    icon: 'Cpu',
    prompt: 'How can I restructure this workload or AI pipeline to take maximum advantage of Groq LPUs, deterministic compiler scheduling, and ultra-high SRAM memory bandwidth?',
  },
];
