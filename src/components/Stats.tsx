const Stats = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-mint">1M+</p>
            <p className="text-white/80">Active Players</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-mint">24/7</p>
            <p className="text-white/80">Live Updates</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-mint">50k+</p>
            <p className="text-white/80">Active Leagues</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;