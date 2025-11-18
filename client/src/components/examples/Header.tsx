import Header from '../Header';

export default function HeaderExample() {
  return (
    <div>
      <Header />
      <div className="container mx-auto p-8">
        <p className="text-muted-foreground">Page content goes here</p>
      </div>
    </div>
  );
}
