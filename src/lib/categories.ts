export const categories = [
  {
    name: 'Cloud',
    slug: 'cloud',
    description: 'Cloud infrastructure, Terraform, Kubernetes, and distributed systems',
    color: '#6366f1',
  },
  {
    name: 'SRE',
    slug: 'sre',
    description: 'Site reliability, observability, incident response, and production engineering',
    color: '#10b981',
  },
  {
    name: 'AI Agent',
    slug: 'ai-agent',
    description: 'AI agents, LLM applications, prompt engineering, and autonomous systems',
    color: '#f43f5e',
  },
  {
    name: 'Thoughts',
    slug: 'thoughts',
    description: 'Personal reflections, industry observations, and random musings',
    color: '#f59e0b',
  },
  {
    name: 'Projects',
    slug: 'projects',
    description: 'Hands-on builds, side projects, and technical experiments',
    color: '#06b6d4',
  },
] as const;

export function getCategoryColor(slug: string): string {
  return categories.find(c => c.slug === slug)?.color ?? '#646cff';
}

export function getCategoryName(slug: string): string {
  return categories.find(c => c.slug === slug)?.name ?? slug;
}
