import styles from './blog.module.css'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const BLOG_POSTS = [
    {
        id: '1',
        title: 'How to Maximize Your LinkedIn Premium Business Subscription',
        excerpt: 'Discover expert tips to get the most value from your LinkedIn Premium subscription and boost your professional network.',
        author: 'Guardify IT Team',
        date: '2026-01-15',
        image: 'https://images.unsplash.com/photo-1611944212129-29990460f15d?w=800&auto=format&fit=crop&q=60',
        category: 'Tips & Tricks'
    },
    {
        id: '2',
        title: '5 Reasons Why Your Business Needs Microsoft Office 365',
        excerpt: 'Learn how Microsoft Office 365 can transform your business operations with cloud-based productivity tools.',
        author: 'Guardify IT Team',
        date: '2026-01-10',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
        category: 'Business Tools'
    },
    {
        id: '3',
        title: 'ChatGPT Plus vs Standard: Is the Upgrade Worth It?',
        excerpt: 'A comprehensive comparison of ChatGPT Plus features versus the free version to help you make an informed decision.',
        author: 'Guardify IT Team',
        date: '2026-01-05',
        image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&auto=format&fit=crop&q=60',
        category: 'AI Tools'
    }
]

export default function BlogPage() {
    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Guardify IT Blog</h1>
                    <p className={styles.subtitle}>
                        Tips, guides, and insights about digital subscriptions and productivity tools
                    </p>
                </div>

                <div className={styles.grid}>
                    {BLOG_POSTS.map((post) => (
                        <article key={post.id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <img src={post.image} alt={post.title} className={styles.image} />
                                <div className={styles.category}>{post.category}</div>
                            </div>

                            <div className={styles.content}>
                                <h2 className={styles.postTitle}>{post.title}</h2>
                                <p className={styles.excerpt}>{post.excerpt}</p>

                                <div className={styles.meta}>
                                    <div className={styles.metaItem}>
                                        <User size={16} />
                                        <span>{post.author}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <Calendar size={16} />
                                        <span>{new Date(post.date).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </div>

                                <Link href={`/blog/${post.id}`} className={styles.readMore}>
                                    Read More
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div className={styles.emptyState}>
                    <p>More blog posts coming soon! Stay tuned for expert tips and guides.</p>
                </div>
            </div>
        </div>
    )
}
