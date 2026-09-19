import type { LucideIcon } from "lucide-react";
import { Clock, MapPin, MessageCircle, Navigation, Phone, Send, Star } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { contactConfig } from "@/lib/contact-config";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-accent">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-foreground/50">{label}</span>
        <span className="text-sm font-semibold text-heading">{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("tel:") ? undefined : "_blank"}
        rel={href.startsWith("tel:") ? undefined : "noopener noreferrer"}
        className="flex items-center gap-3 transition-colors hover:text-accent"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}

export function ContactSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: SITE_NAME,
    address: contactConfig.address,
    telephone: contactConfig.phone,
    url: SITE_URL,
    sameAs: [contactConfig.facebookUrl].filter(Boolean),
  };

  return (
    <section id="lien-he" className="bg-secondary/30 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container>
        <FadeIn className="text-center">
          <h2 className="font-display text-3xl font-bold text-heading sm:text-4xl">
            Liên hệ {SITE_NAME}
          </h2>
          <p className="mt-2 text-foreground/70">Hoa tươi · Hoa tiệc · Hoa sinh nhật · Khai trương</p>
        </FadeIn>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <FadeIn className="space-y-5 rounded-brand border-2 border-secondary bg-white p-6 sm:p-8">
            <ContactRow icon={MapPin} label="Địa chỉ" value={contactConfig.address} />
            <ContactRow
              icon={Phone}
              label="Hotline"
              value={contactConfig.phoneDisplay}
              href={`tel:${contactConfig.phone}`}
            />
            <ContactRow icon={Send} label="Zalo" value="Chat với shop qua Zalo" href={contactConfig.zaloUrl} />
            <ContactRow
              icon={MessageCircle}
              label="Messenger"
              value="Nhắn tin qua Messenger"
              href={contactConfig.messengerUrl}
            />
            <ContactRow icon={Clock} label="Giờ mở cửa" value={contactConfig.openingHours} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t-2 border-secondary pt-5">
              <a
                href={contactConfig.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105"
              >
                <Navigation size={15} />
                Chỉ đường đến shop
              </a>

              {contactConfig.googleRating != null && (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-heading">
                  <Star size={16} className="fill-accent text-accent" />
                  {contactConfig.googleRating.toFixed(1)}/5
                  {contactConfig.googleReviewCount != null && (
                    <span className="font-normal text-foreground/60">
                      ({contactConfig.googleReviewCount} đánh giá Google)
                    </span>
                  )}
                </span>
              )}

              <a
                href={contactConfig.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
              >
                Xem đánh giá trên Google →
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="min-h-[360px] overflow-hidden rounded-brand border-2 border-secondary">
            <iframe
              src={contactConfig.googleMapsEmbedUrl}
              className="h-full min-h-[360px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí cửa hàng trên Google Maps"
            />
          </FadeIn>
        </div>

        <FadeIn className="mt-10 rounded-brand bg-heading px-6 py-10 text-center text-white sm:px-10">
          <h3 className="font-display text-2xl font-bold">Bạn đang cần một bó hoa thật đẹp?</h3>
          <p className="mx-auto mt-2 max-w-md text-white/70">
            {SITE_NAME} sẵn sàng tư vấn mẫu hoa phù hợp với dịp của bạn.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={contactConfig.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-heading shadow-lg transition-transform hover:scale-105"
            >
              <MessageCircle size={16} />
              Nhắn Messenger
            </a>
            <a
              href={contactConfig.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Send size={16} />
              Chat Zalo
            </a>
            <a
              href={`tel:${contactConfig.phone}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Phone size={16} />
              Gọi ngay
            </a>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
