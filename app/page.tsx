import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { StatsSection } from "@/components/home/stats-section"
import { PrincipalSection } from "@/components/home/principal-section"
import { AnnouncementsSection } from "@/components/home/announcements-section"
import { EventsSection } from "@/components/home/events-section"
import { GallerySection } from "@/components/home/gallery-section"
import { ClubsSection } from "@/components/home/clubs-section"
import { ContactSection } from "@/components/home/contact-section"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <PrincipalSection />
        <AnnouncementsSection />
        <EventsSection />
        <GallerySection />
        <ClubsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
