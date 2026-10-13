interface PlaceholderPageProps {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <p className="text-muted-foreground">{title}</p>
    </div>
  )
}
