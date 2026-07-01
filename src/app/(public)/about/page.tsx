"use client";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">हमारे बारे में</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed">
          हम एक विश्वसनीय समाचार मंच हैं जो आपको सटीक और निष्पक्ष समाचार प्रदान करते हैं।
          हमारी टीम अनुभवी पत्रकारों और संपादकों से बनी है जो गुणवत्तापूर्ण पत्रकारिता के लिए समर्पित हैं।
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          हमारा उद्देश्य समाज को सही और समय पर जानकारी प्रदान करना है।
        </p>
      </div>
    </div>
  );
}
