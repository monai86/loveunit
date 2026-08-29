'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, 
  Download, 
  X, 
  ZoomIn, 
  Sparkles, 
  Heart, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  Gift,
  IdCard,
  Share2,
  Check
} from 'lucide-react';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const OFFICIAL_POSTERS = [
  {
    src: '/images/poster-th.jpg',
    label: 'ภาษาไทย (A4 Official)',
    badge: 'A4 ไทย',
    title: 'โปสเตอร์ประชาสัมพันธ์ทางการ (ภาษาไทย)',
    titleEn: 'Official Event Poster (Thai)',
    alt: 'โปสเตอร์ประชาสัมพันธ์ MUMT Blood Donation 2026 ครั้งที่ 9 เวลา 09.00 - 14.00 น. (ภาษาไทย)',
    fileName: 'mumt-blood-donation-2026-poster-th.jpg',
    aspectRatio: '1655 / 2340',
    description: 'โปสเตอร์ทางการระบุเวลา 09.00 - 14.00 น., สถานที่ห้อง 217 อาคารสิริวิทยา, เบอร์ติดต่อ และรายละเอียดโครงการ',
    descriptionEn: 'Official poster with updated time 09:00 - 14:00, Sirividhaya Room 217, contact info and event details.',
  },
  {
    src: '/images/poster-en.jpg',
    label: 'English (A4 Official)',
    badge: 'A4 EN',
    title: 'โปสเตอร์ประชาสัมพันธ์ทางการ (English)',
    titleEn: 'Official Event Poster (English)',
    alt: 'MUMT Blood Donation 2026 9th Event Poster 09.00 AM - 02.00 PM (English)',
    fileName: 'mumt-blood-donation-2026-poster-en.jpg',
    aspectRatio: '1655 / 2340',
    description: 'โปสเตอร์ภาษาอังกฤษทางการระบุเวลา 09:00 AM – 2:00 PM, สถานที่ และรายละเอียดการรับจิตอาสา',
    descriptionEn: 'Official English event poster with updated schedule (09:00 AM – 2:00 PM), venue, and volunteer hours.',
  },
  {
    src: '/images/poster-a3-minimal.jpg',
    label: 'A3 Minimal Design',
    badge: 'A3 Minimal',
    title: 'โปสเตอร์แบบมินิมอล “Give Blood Give Love” (A3)',
    titleEn: 'Minimalist Poster "Give Blood Give Love" (A3)',
    alt: 'โปสเตอร์ Love Unit 2 A3 มินิมอล Give Blood Give Love ครั้งที่ 9',
    fileName: 'mumt-loveunit-poster-a3-minimal.jpg',
    aspectRatio: '3307 / 2340',
    description: 'โปสเตอร์ขนาด A3 สไตล์มินิมอลโมเดิร์น สื่อถึงพลังแห่งความรักและการให้เพื่อต่อชีวิตผู้ป่วย',
    descriptionEn: 'A3 minimalist modern poster depicting love and the life-saving impact of blood donation.',
  },
];

const EDUCATIONAL_INFOGRAPHICS = [
  {
    src: '/images/education/blood-groups-part1.png',
    title: 'ความรู้กรุ๊ปเลือด: เลือดกรุ๊ปไหน ให้ใครได้บ้าง?',
    titleEn: 'Blood Group Compatibility: Who can donate to whom?',
    badge: 'ABO Group',
    desc: 'ตารางความเข้ากันได้ของเม็ดเลือดแดงระบบ ABO พร้อมสัดส่วนหมู่เลือดในประชากรไทย (O 38%, B 34%, A 24%, AB 8%)',
    descEn: 'ABO red blood cell compatibility chart and Thai population distribution (O 38%, B 34%, A 24%, AB 8%)',
    fileName: 'blood-groups-part1-abo.png',
  },
  {
    src: '/images/education/blood-groups-part2.png',
    title: 'ความรู้เรื่องกรุ๊ปเลือด: Rh+ vs Rh-',
    titleEn: 'Rh System: Rh Positive vs Rh Negative (Rare Blood)',
    badge: 'Rh System',
    desc: 'เปรียบเทียบ Rh Positive (99.7% มีแอนติเจน D) และ Rh Negative (0.3% หมู่เลือดหายาก 3 ใน 1,000 คน) การให้และการรับโลหิตอย่างปลอดภัย',
    descEn: 'Comparing Rh Positive (99.7%) and Rh Negative (0.3% rare group in Thailand) for transfusion safety.',
    fileName: 'blood-groups-part2-rh.png',
  },
  {
    src: '/images/education/benefits-5-reasons.png',
    title: '5 ข้อดีของการบริจาคโลหิต',
    titleEn: '5 Health Benefits of Blood Donation',
    badge: 'Health Benefits',
    desc: 'ร่างกายแข็งแรง, ผิวพรรณเปล่งปลั่ง, ลดความเสี่ยงหลอดเลือดแดงตีบ, กระตุ้นไขกระดูกสร้างเม็ดเลือดใหม่ และรู้ข้อมูลสุขภาพเบื้องต้น',
    descEn: 'Physical vitality, radiant complexion, cardiovascular benefits, bone marrow stimulation, and free health check.',
    fileName: '5-benefits-of-blood-donation.png',
  },
  {
    src: '/images/education/blood-components-1.png',
    title: 'เลือด 1 ถุง นำไปทำอะไรได้บ้าง?',
    titleEn: 'What is inside 1 unit of donated blood?',
    badge: 'Blood Components',
    desc: 'การปั่นแยกส่วนประกอบโลหิต 3 ส่วน: พลาสมา 55%, เกล็ดเลือดและเม็ดเลือดขาว ~1%, เม็ดเลือดแดง 44%',
    descEn: 'Separation of whole blood into Plasma (55%), Platelets/WBC (~1%), and Packed RBC (44%).',
    fileName: 'blood-components-separation.png',
  },
  {
    src: '/images/education/blood-components-2.png',
    title: 'โลหิต 1 ถุง ช่วยชีวิตใครได้บ้าง?',
    titleEn: 'How 1 blood donation saves multiple lives',
    badge: 'Patient Support',
    desc: 'พลาสมาช่วยผู้ป่วยตับแข็ง/ฮีโมฟีเลีย/แผลไฟไหม้, เกล็ดเลือดช่วยไข้เลือดออก/มะเร็ง, เม็ดเลือดแดงช่วยธาลัสซีเมียและอุบัติเหตุ',
    descEn: 'Plasma for liver disease & burns, Platelets for dengue & cancer, RBC for thalassemia & trauma surgery.',
    fileName: 'blood-components-lifesaving.png',
  },
  {
    src: '/images/education/why-blood-matters.png',
    title: 'ความสำคัญของการบริจาคเลือด',
    titleEn: 'Why Blood Donation Matters',
    badge: 'Lifesaving Mission',
    desc: 'โลหิตไม่สามารถสังเคราะห์ได้ ต้องได้จากมนุษย์เท่านั้น และการสำรองโลหิตให้พร้อมทั้งในภาวะปกติและฉุกเฉิน',
    descEn: 'Blood cannot be synthetically manufactured. Regular donor supply is vital for emergencies.',
    fileName: 'why-blood-donation-matters.png',
  },
];

export default function PosterPage() {
  const { isTh, isEn } = useLanguage();
  const [activePoster, setActivePoster] = useState<{ src: string; title: string; alt: string; fileName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activePoster) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePoster(null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activePoster]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: isTh ? 'MUMT Blood Donation 2026 ครั้งที่ 9' : '9th MUMT Blood Donation 2026',
          text: isTh 
            ? 'ขอเชิญร่วมบริจาคโลหิต “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ” 16 ก.ย. 2569 เวลา 09.00 - 14.00 น. ณ อาคารสิริวิทยา ม.มหิดล ศาลายา'
            : 'Join the 9th MUMT Blood Donation on Sep 16, 2026, 09:00 - 14:00 at Sirividhaya Building, Mahidol University.',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 space-y-12">
      
      {/* Breadcrumb + Header */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--burgundy-600)]">{isTh ? 'หน้าแรก' : 'Home'}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--burgundy-700)]">{isTh ? 'โปสเตอร์ & สื่อประชาสัมพันธ์' : 'Posters & Media'}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-black text-[var(--burgundy-700)] border border-[var(--line)]">
              <Sparkles className="h-3.5 w-3.5 fill-[var(--burgundy-700)]" />
              <span>{isTh ? 'อัปเดตเวลาจัดงานอย่างเป็นทางการ: 09.00 - 14.00 น.' : 'Official Event Time: 09:00 AM – 02:00 PM'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
              {isTh ? 'โปสเตอร์และสื่อประชาสัมพันธ์' : 'Official Posters & Media'}
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              {isTh 
                ? 'สื่อประชาสัมพันธ์อย่างเป็นทางการของงาน MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ” ครั้งที่ 9 — แตะเพื่อดูภาพความละเอียดสูง หรือกดดาวน์โหลดเพื่อนำไปเผยแพร่และแชร์ต่อ'
                : 'Official media and downloadable promotional assets for the 9th MUMT Blood Donation Event 2026. Click to inspect high-resolution posters or download them for distribution.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-[var(--line)] px-4 py-2.5 text-xs font-extrabold text-[var(--ink)] shadow-xs hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)] transition-all cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-[var(--burgundy-600)]" />}
              <span>{copied ? (isTh ? 'คัดลอกลิงก์แล้ว' : 'Link Copied!') : (isTh ? 'แชร์หน้านี้' : 'Share Page')}</span>
            </button>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--burgundy-600)] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[var(--burgundy-700)] transition-all cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>{isTh ? 'ลงทะเบียนออนไลน์' : 'Register Online'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Event Facts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-[var(--rose-100)]/60 border border-[var(--line)]">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white text-[var(--burgundy-700)] shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[var(--muted)] block">{isTh ? 'วันที่จัดงาน' : 'Date'}</span>
            <span className="text-sm font-black text-[var(--ink)]">{isTh ? 'วันพุธที่ 16 ก.ย. 2569' : 'Wed, Sep 16, 2026'}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white text-[var(--burgundy-700)] shadow-xs">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[var(--muted)] block">{isTh ? 'เวลาจัดงาน' : 'Time'}</span>
            <span className="text-sm font-black text-[var(--burgundy-700)]">09:00 – 14:00 น.</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white text-[var(--burgundy-700)] shadow-xs">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[var(--muted)] block">{isTh ? 'สถานที่จัดงาน' : 'Venue'}</span>
            <span className="text-xs font-black text-[var(--ink)]">{isTh ? 'ห้อง 217 อาคารสิริวิทยา' : 'Room 217, Sirividhaya'}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white text-[var(--burgundy-700)] shadow-xs">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[var(--muted)] block">{isTh ? 'ของที่ระลึก' : 'Donor Gift'}</span>
            <span className="text-xs font-black text-amber-900">{isTh ? 'Limited Edition MUMT' : 'Limited Edition'}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: OFFICIAL EVENT POSTERS */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--burgundy-600)]" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">{isTh ? 'โปสเตอร์ประชาสัมพันธ์หลัก' : 'Official Event Posters'}</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)] font-medium">
            {isTh ? 'โปสเตอร์ขนาดมาตรฐานสำหรับงานพิมพ์และเผยแพร่บนสื่อดิจิทัล' : 'High-resolution print and social media formats'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFICIAL_POSTERS.map((poster) => (
            <article key={poster.src} className="editorial-card overflow-hidden flex flex-col justify-between p-4 group">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setActivePoster({ src: poster.src, title: isTh ? poster.title : poster.titleEn, alt: poster.alt, fileName: poster.fileName })}
                  aria-label={isTh ? `ขยายโปสเตอร์ ${poster.title}` : `Zoom poster ${poster.titleEn}`}
                  className="relative w-full overflow-hidden rounded-xl bg-gray-50 border border-[var(--line)] cursor-zoom-in block"
                  style={{ aspectRatio: poster.aspectRatio }}
                >
                  <Image
                    src={poster.src}
                    alt={poster.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 95vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-[var(--burgundy-700)] px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-md">
                    {poster.badge}
                  </span>
                  <span className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--burgundy-700)] shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                </button>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[var(--ink)] leading-snug">{isTh ? poster.title : poster.titleEn}</h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">{isTh ? poster.description : poster.descriptionEn}</p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[var(--line)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActivePoster({ src: poster.src, title: isTh ? poster.title : poster.titleEn, alt: poster.alt, fileName: poster.fileName })}
                  className="text-xs font-bold text-[var(--burgundy-700)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ดูภาพขยาย' : 'Zoom In'}</span>
                </button>
                <a
                  href={poster.src}
                  download={poster.fileName}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--rose-100)] hover:bg-[var(--rose-200)] text-[var(--burgundy-700)] px-3 py-1.5 text-xs font-extrabold border border-[var(--line)] transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ดาวน์โหลด' : 'Download'}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: EDUCATIONAL INFOGRAPHICS */}
      <section className="space-y-6 pt-6 border-t border-[var(--line)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">{isTh ? 'ชุดภาพอินโฟกราฟิกให้ความรู้' : 'Educational Infographics'}</h2>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)] font-medium">
              {isTh 
                ? 'เผยแพร่จากแคมเปญ Instagram & TikTok @mumt_loveunit อ้างอิงศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย'
                : 'From Instagram & TikTok @mumt_loveunit campaigns, based on Thai Red Cross Society standards.'}
            </p>
          </div>
          <Link
            href="/knowledge"
            className="text-xs font-extrabold text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{isTh ? 'อ่านบทความวิชาการ & แล็บตรวจ →' : 'Read Lab Science Articles →'}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EDUCATIONAL_INFOGRAPHICS.map((item) => (
            <article key={item.src} className="editorial-card overflow-hidden flex flex-col justify-between p-4 group">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setActivePoster({ src: item.src, title: isTh ? item.title : item.titleEn, alt: isTh ? item.title : item.titleEn, fileName: item.fileName })}
                  aria-label={isTh ? `ขยายภาพ ${item.title}` : `Zoom image ${item.titleEn}`}
                  className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-white border border-[var(--line)] cursor-zoom-in block"
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-md">
                    {item.badge}
                  </span>
                  <span className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--burgundy-700)] shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                </button>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[var(--ink)] leading-snug">{isTh ? item.title : item.titleEn}</h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">{isTh ? item.desc : item.descEn}</p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[var(--line)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActivePoster({ src: item.src, title: isTh ? item.title : item.titleEn, alt: isTh ? item.title : item.titleEn, fileName: item.fileName })}
                  className="text-xs font-bold text-[var(--burgundy-700)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ดูภาพขนาดเต็ม' : 'Full Image'}</span>
                </button>
                <a
                  href={item.src}
                  download={item.fileName}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--rose-100)] hover:bg-[var(--rose-200)] text-[var(--burgundy-700)] px-3 py-1.5 text-xs font-extrabold border border-[var(--line)] transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ดาวน์โหลด' : 'Download'}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 3: IMPORTANT NOTICES & CONTACTS */}
      <section className="editorial-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-base font-black text-[var(--burgundy-700)] uppercase tracking-wider flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              <span>{isTh ? 'สิ่งที่ต้องเตรียมและข้อควรทราบ' : 'Checklist & Requirements'}</span>
            </h3>
            <ul className="space-y-2.5 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>{isTh ? <strong>โปรดแสดงบัตรประจำตัวประชาชน</strong> : <strong>Bring Original National ID Card</strong>} {isTh ? 'หรือบัตรประจำตัวผู้บริจาคโลหิตสภากาชาดไทย' : 'or Red Cross donor card.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>{isTh ? <strong>ตรวจคัดกรองสุขภาพและหมู่โลหิต:</strong> : <strong>Health & Blood Screening:</strong>} {isTh ? 'ตรวจความเข้มข้นเลือด (Hb), ความดันโลหิต และตรวจแล็บมาตรฐาน' : 'Hb level, vital signs, and safety protocols.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>{isTh ? <strong>รับของที่ระลึกสุดพิเศษ!</strong> : <strong>Special Souvenirs!</strong>} {isTh ? 'สำหรับผู้เข้าร่วมกิจกรรมและผู้บริจาคโลหิตทุกท่าน' : 'For all participating blood donors.'}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-[var(--burgundy-700)] uppercase tracking-wider flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span>{isTh ? 'ติดต่อสอบถามข้อมูลเพิ่มเติม' : 'Contact Staff'}</span>
            </h3>
            <div className="p-4 rounded-xl bg-[var(--rose-100)]/50 border border-[var(--line)] space-y-2 text-xs font-bold text-[var(--ink)]">
              <div className="flex items-center justify-between">
                <span>{isTh ? 'เปา' : 'Pao'}</span>
                <a href="tel:0969866245" className="font-mono text-sm text-[var(--burgundy-700)] hover:underline">09-6986-6245</a>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-2">
                <span>{isTh ? 'แตงโม' : 'Tangmo'}</span>
                <a href="tel:0656274319" className="font-mono text-sm text-[var(--burgundy-700)] hover:underline">06-5627-4319</a>
              </div>
              <div className="border-t border-[var(--line)] pt-2.5">
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {activePoster && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePoster.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setActivePoster(null)}
        >
          <button
            type="button"
            onClick={() => setActivePoster(null)}
            aria-label={isTh ? "ปิด" : "Close"}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40 focus:outline-none cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-h-[80vh] max-w-full overflow-auto rounded-xl shadow-2xl bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePoster.src}
                alt={activePoster.alt}
                className="max-h-[75vh] w-auto mx-auto rounded-lg object-contain"
              />
            </div>
            <figcaption className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <span className="text-sm font-extrabold text-center sm:text-left">{activePoster.title}</span>
              <a
                href={activePoster.src}
                download={activePoster.fileName}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2 text-xs font-black text-[var(--burgundy-700)] shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isTh ? 'ดาวน์โหลดภาพต้นฉบับ' : 'Download Image'}</span>
              </a>
            </figcaption>
          </figure>
        </div>
      )}

    </div>
  );
}
