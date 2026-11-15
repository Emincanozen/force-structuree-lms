import * as React from "react";
import { ArrowRight } from "lucide-react";
// Dans ce projet, `cn` vient de @/lib/shadcn-utils : @/lib/utils est le
// module utilitaire de CourseLit (capitalize, getAddress...) et n'expose
// pas `cn`. L'alias est declare dans components.json.
import { cn } from "@/lib/shadcn-utils";

export interface Stat {
    icon: React.ReactNode;
    label: string;
}

export interface AnimatedHikeCardProps {
    title: string;
    images: string[];
    stats: Stat[];
    description: string;
    href: string;
    className?: string;
}

export const AnimatedHikeCard = React.forwardRef<
    HTMLAnchorElement,
    AnimatedHikeCardProps
>(({ title, images, stats, description, href, className }, ref) => {
    return (
        <a
            ref={ref}
            href={href}
            className={cn(
                "group relative block w-full max-w-sm cursor-pointer rounded-2xl border bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg lg:max-w-md",
                className,
            )}
            aria-label={`En savoir plus sur ${title}`}
        >
            <div className="flex flex-col">
                {/* En-tete : titre et fleche */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tighter">
                        {title}
                    </h2>
                    <ArrowRight className="h-6 w-6 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </div>

                {/* Images empilees qui s'ecartent au survol */}
                <div className="relative mb-6 h-32">
                    {images.map((src, index) => (
                        <div
                            key={index}
                            className={cn(
                                "absolute h-full w-[40%] overflow-hidden rounded-lg border-2 border-background shadow-md transition-all duration-300 ease-in-out",
                                "group-hover:translate-x-[var(--tx)] group-hover:rotate-[var(--r)]",
                            )}
                            style={
                                {
                                    transform: `translateX(${index * 32}px)`,
                                    "--tx": `${index * 80}px`,
                                    "--r": `${index * 5 - 5}deg`,
                                    zIndex: images.length - index,
                                } as React.CSSProperties
                            }
                        >
                            <img
                                src={src}
                                alt={`${title}, vue ${index + 1}`}
                                loading="lazy"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Chiffres cles */}
                <div className="mb-4 flex items-center space-x-4 text-sm text-muted-foreground">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-1.5"
                        >
                            {stat.icon}
                            <span>{stat.label}</span>
                        </div>
                    ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </a>
    );
});

AnimatedHikeCard.displayName = "AnimatedHikeCard";
