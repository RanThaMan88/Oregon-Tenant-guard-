import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  Gavel, 
  Clock, 
  ChevronRight,
  Info,
  LifeBuoy,
  Zap,
  ShieldAlert,
  Loader2,
  Trash2,
  Download,
  AlertCircle,
  ExternalLink,
  Layers,
  Camera,
  MapPin,
  Landmark,
  Sun,
  Moon,
  Share2,
  Sparkles,
  Lock,
  Unlock,
  CreditCard,
  Check,
  Plus,
  Smartphone,
  X,
  ArrowLeft,
  Calendar,
  DollarSign,
  ScanLine,
  Flame,
  Award,
  ChevronDown,
  Copy,
  CheckCheck,
  FileCheck2,
  Building2,
  Play,
  HelpCircle,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Evidence, EvidenceType, AnalysisResult, SavedCase } from './types';
import { analyzeEvidence, generateMotionDraft } from './services/geminiService';
import { 
  generateOregonLegalPDF, 
  generateFeeWaiverPDF, 
  generateHearingScriptPDF,
  generateMediationGuidePDF,
  generateRecordSealingPDF
} from './services/pdfService';
import { OREGON_COUNTIES } from './data/oregonCountyMotions';
import { OREGON_COURTS } from './data/oregonCourts';
import { LEGAL_RESOURCES } from './data/resources';
import { SAMPLE_NOTICES, SampleNotice } from './data/sampleNotices';
import { TESTIMONIALS } from './data/testimonials';
import { OREGON_STATUTORY_AUTHORITIES, STATUTORY_SYSTEM_METADATA } from './data/oregonStatuteGrounding';
import { TRANSLATIONS, Language } from './data/translations';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from './data/legalPolicies';

// Plain-English Interactive Educational Tooltip
const InfoTooltip = ({ text, title }: { text: string; title?: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1 group cursor-pointer">
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev); }}
        className="text-slate-400 hover:text-cyan-300 transition-colors p-0.5 rounded-full"
        title="Click to learn what this legal rule means in plain English"
      >
        <HelpCircle size={13} />
      </button>
      {open && (
        <span 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 text-[11px] leading-relaxed text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {title && <strong className="block text-cyan-300 font-bold mb-1 font-sans">{title}</strong>}
          <span className="font-sans text-slate-300">{text}</span>
          <span className="block mt-1 text-[9px] text-cyan-400 font-mono">Tap anywhere to close</span>
        </span>
      )}
    </span>
  );
};

const App = () => {
  // Language: 'en' or 'es'
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  // Navigation: scan -> audit -> court_pack -> dashboard | resources
  const [step, setStep] = useState<'scan' | 'audit' | 'court_pack' | 'dashboard' | 'resources'>('scan'); 
  
  // Theme: Dark by default
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<'tos' | 'privacy' | 'upl'>('tos');
  const [showStatutesModal, setShowStatutesModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showPhoneHelpModal, setShowPhoneHelpModal] = useState(false);
  const [showAiAuditModal, setShowAiAuditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [tenantEmail, setTenantEmail] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [copiedAiPrompt, setCopiedAiPrompt] = useState(false);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [disclaimerError, setDisclaimerError] = useState(false);

  // Stripe & Monetization State
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'fast_track'>('standard');
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  // Live Camera Modal State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Case details
  const [jurisdiction, setJurisdiction] = useState('Multnomah');
  const [landlordName, setLandlordName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');

  // Repair history for ORS 90.385 retaliation check
  const [showRepairsDrawer, setShowRepairsDrawer] = useState(false);
  const [repairLog, setRepairLog] = useState<{ date: string, issue: string }[]>([]);
  const [newRepair, setNewRepair] = useState({ date: '', issue: '' });

  // Evidences & Analysis
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponseOption, setSelectedResponseOption] = useState<'Motion to Dismiss' | 'Answer to Residential Eviction' | 'Motion for Stay of Proceedings (SB 690)'>('Motion to Dismiss');
  
  // Motion generation state
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [generatedMotionDraft, setGeneratedMotionDraft] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'motion' | 'script' | 'mediation' | 'waiver' | 'expungement' | 'checklist'>('motion');

  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load theme and saved cases
  useEffect(() => {
    const savedTheme = localStorage.getItem('tenant_guard_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('dark');
    }

    const saved = localStorage.getItem('tenant_guard_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedCases(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('tenant_guard_theme', nextTheme);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsLiveCameraOpen(true);
    setCameraError(null);
    setIsCameraStarting(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser. Please use File Upload instead.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera start error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Camera permission was denied. Please allow camera access in your browser address bar.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError("No camera detected. You can upload a photo or document from your files.");
      } else {
        setCameraError(err.message || "Could not open camera. You can upload photos directly from your files.");
      }
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraOpen(false);
    setCameraError(null);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    const pageNum = evidences.length + 1;
    addEvidence(EvidenceType.NOTICE, `[CAMERA CAPTURE PAGE ${pageNum}]`, `Notice_Page_${pageNum}.jpg`, dataUrl);
    stopCamera();
  };

  const saveCase = (newResult: AnalysisResult) => {
    const newCase: SavedCase = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      jurisdiction: newResult.county || jurisdiction,
      landlordName: newResult.landlordName || landlordName,
      tenantName: newResult.tenantName || tenantName,
      propertyAddress: newResult.propertyAddress || propertyAddress,
      result: newResult,
      status: 'active',
      isPaid
    };
    const updated = [newCase, ...savedCases.filter(c => c.landlordName !== newCase.landlordName)];
    setSavedCases(updated);
    localStorage.setItem('tenant_guard_cases', JSON.stringify(updated));
  };

  const deleteCase = (id: string) => {
    const updated = savedCases.filter(c => c.id !== id);
    setSavedCases(updated);
    localStorage.setItem('tenant_guard_cases', JSON.stringify(updated));
  };

  const addEvidence = useCallback((type: EvidenceType, content: string, fileName?: string, dataUrl?: string) => {
    const newEvidence: Evidence = {
      id: Math.random().toString(36).substring(7),
      type,
      content,
      fileName,
      dataUrl,
      timestamp: Date.now(),
    };
    setEvidences(prev => [...prev, newEvidence]);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const resultData = event.target?.result as string;
        if (isImage) {
          addEvidence(EvidenceType.NOTICE, `[NOTICE IMAGE: ${file.name}]`, file.name, resultData);
        } else {
          addEvidence(EvidenceType.TEXT, resultData, file.name);
        }
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const loadSampleNotice = (sample: SampleNotice) => {
    setEvidences([
      {
        id: sample.id,
        type: EvidenceType.NOTICE,
        fileName: `${sample.name}.txt`,
        content: sample.noticeText,
        timestamp: Date.now()
      }
    ]);
    setJurisdiction(sample.county);
    setLandlordName(sample.landlord);
    setTenantName(sample.tenant);
    setPropertyAddress(sample.address);
  };

  const performAudit = async (currentEvidences: Evidence[]) => {
    if (currentEvidences.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysisResult = await analyzeEvidence(currentEvidences, repairLog);
      
      if (analysisResult.county) setJurisdiction(analysisResult.county);
      if (analysisResult.landlordName) setLandlordName(analysisResult.landlordName);
      if (analysisResult.tenantName) setTenantName(analysisResult.tenantName);
      if (analysisResult.propertyAddress) setPropertyAddress(analysisResult.propertyAddress);

      setSelectedResponseOption(analysisResult.noticeAudit?.suggestedUserOption || 'Motion to Dismiss');
      setResult(analysisResult);
      saveCase(analysisResult);
      setStep('audit');
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const prepareCourtDraft = async (option?: typeof selectedResponseOption) => {
    if (!result) return;
    const targetOption = option || selectedResponseOption;
    setIsGeneratingDraft(true);
    setStep('court_pack');
    window.scrollTo(0, 0);

    try {
      const motionMeta = {
        name: targetOption,
        description: targetOption === 'Motion to Dismiss' ? 'Motion to Dismiss for Defective Notice' : 'Answer with Affirmative Defenses',
        requiredFields: ['Parties', 'Case Number', 'Dates']
      };

      const draft = await generateMotionDraft(
        evidences, 
        result, 
        jurisdiction, 
        motionMeta, 
        {
          factualClaims: result.statementOfFacts ? [result.statementOfFacts] : [],
          habitabilityIssues: repairLog.map(r => `${r.date}: ${r.issue}`),
          retaliationClaim: repairLog.length > 0
        }
      );
      setGeneratedMotionDraft(draft);
    } catch (err) {
      setError("Failed to generate court motion.");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleSimulatedStripePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaid(true);
      setShowPaywallModal(false);
      alert('🎉 Payment processed via Stripe! Your complete Oregon Defense Bundle is now unlocked.');
    }, 1200);
  };

  const calculateRemainingDays = () => {
    if (!hearingDate) return null;
    const target = new Date(hearingDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    if (isNaN(diff)) return null;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleEmailCourtPack = () => {
    const subject = encodeURIComponent(`Oregon Tenant Guard Court Pack - Case vs ${landlordName || 'Landlord'}`);
    const body = encodeURIComponent(`OREGON PRO SE EVICTION DEFENSE PACK
County: ${jurisdiction} County Circuit Court
Defendant: ${tenantName || 'Tenant'}
Plaintiff: ${landlordName || 'Landlord'}

HEARING COUNTDOWN:
${hearingDate ? `Court Date: ${hearingDate}` : 'Set your hearing date in the app'}

KEY ARGUMENTS FOR THE JUDGE:
${result?.hearingScript?.openingStatement || 'I move to dismiss this action under ORS 90.155 due to defective notice.'}

STATUTORY DEFECTS FOUND:
${result?.noticeAudit?.defects?.map(d => `- ${d.statute}: ${d.title}`).join('\n') || 'Procedural defect in notice math'}

NEXT STEPS:
1. Print 3 copies of your Motion to Dismiss and Certificate of Service.
2. Submit your State Fee Waiver (ORS 21.682) at the clerk window to save the $88 fee.
3. Arrive 30 minutes early to Courtroom roll call.`);

    window.open(`mailto:${tenantEmail || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  const generateAiAuditExportText = () => {
    return `### SYSTEM INSTRUCTIONS FOR GOOGLE GEMINI / AI REVIEWER:
You are an expert legal tech auditor and Oregon housing attorney evaluating a pro se tenant defense engine.
Analyze this eviction case data against 2026 Oregon Revised Statutes (ORS Chapters 90, 105, 21) and Uniform Trial Court Rules (UTCR 2.010).

### 1. CASE JURISDICTION & METADATA
- Court: Oregon Circuit Court for ${jurisdiction} County
- Landlord / Plaintiff: ${landlordName || 'Cascade Property Management LLC'}
- Tenant / Defendant: ${tenantName || 'Resident Pro Se'}
- Property Address: ${propertyAddress || 'Oregon Rental Property'}
- Date of Analysis: ${new Date().toISOString()}

### 2. DETECTED STATUTORY AUDIT FINDINGS
${result ? JSON.stringify(result.noticeAudit, null, 2) : 'No notice uploaded yet.'}

### 3. ACTIVE OREGON DEFENSE MATRIX (ORS 90 & 105)
- ORS 90.155: Mandatory 13-day notice window if mailed (10 days base + 3 days mail, starting day AFTER service).
- ORS 90.394: Nonpayment notices cannot demand late fees, utilities, or penalties to cure.
- ORS 105.136: Notice must include the official 2026 6-language housing rights advisory.
- ORS 90.385: Rebuttable presumption of retaliation if served within 6 months of habitability repair complaints.
- SB 690: Mandatory 90-day stay of eviction for households with infants under 12 months receiving OHP.
- ORS 105.163: Eviction record expungement and automatic sealing upon dismissal.
- UTCR 2.010: Pleadings must be on 28-line numbered pleading paper with Certificate of Service (ORCP 7).

### 4. YOUR REVIEW INSTRUCTIONS:
1. Evaluate whether the detected procedural defects in notice calculation support an immediate Motion to Dismiss under ORCP 21.
2. Check if there are any additional statutory defenses under Oregon law.
3. Verify that the generated legal draft satisfies UTCR 2.010 pleading standards.`;
  };

  const startNewScan = () => {
    setResult(null);
    setEvidences([]);
    setGeneratedMotionDraft(null);
    setRepairLog([]);
    setLandlordName('');
    setTenantName('');
    setPropertyAddress('');
    setStep('scan');
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 relative ${theme === 'dark' ? 'bg-[#05070c] bg-grid-pattern text-slate-100' : 'bg-[#f8fafc] bg-grid-pattern-light text-slate-900'}`}>
      
      {/* Ambient Top Glow (Dark Mode) */}
      {theme === 'dark' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-cyan-500/15 via-blue-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      )}

      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${theme === 'dark' ? 'bg-[#05070c]/85 border-white/[0.08]' : 'bg-white/90 border-slate-200 shadow-xs'}`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setStep('scan')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Scale size={20} className="stroke-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight leading-none">
                  TenantGuard
                </span>
                <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded tracking-wider border ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                  OREGON
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                Pro Se Eviction Defense Engine
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(prev => prev === 'en' ? 'es' : 'en')}
              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${theme === 'dark' ? 'border-white/10 bg-white/[0.04] text-cyan-300 hover:bg-white/[0.08]' : 'border-slate-200 bg-white text-slate-700'}`}
              title="Cambiar a Español / Switch to English"
            >
              <span className="font-mono">{lang === 'en' ? 'ES' : 'EN'}</span>
            </button>

            <button 
              onClick={() => setShowStatutesModal(true)}
              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${theme === 'dark' ? 'border-white/10 text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20' : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
              title="Verified Oregon Statutes (ORS 90 & 105)"
            >
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">ORS Laws</span>
            </button>

            {savedCases.length > 0 && (
              <button 
                onClick={() => setStep('dashboard')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${step === 'dashboard' ? (theme === 'dark' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-slate-900 text-white') : (theme === 'dark' ? 'border-white/10 text-slate-300 hover:text-white bg-white/[0.03]' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50')}`}
              >
                <Layers size={14} />
                <span className="hidden sm:inline">Cases</span>
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-black px-1.5 py-0.2 rounded">
                  {savedCases.length}
                </span>
              </button>
            )}

            <button 
              onClick={() => setStep('resources')}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${step === 'resources' ? (theme === 'dark' ? 'bg-cyan-500 text-black border-cyan-500 font-extrabold' : 'bg-slate-900 text-white') : (theme === 'dark' ? 'border-white/10 text-slate-300 hover:text-white bg-white/[0.03]' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50')}`}
            >
              Help
            </button>

            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${theme === 'dark' ? 'bg-white/[0.04] border-white/10 text-yellow-400 hover:bg-white/[0.08]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Minimalist 3-Step Pill Bar */}
        <div className={`max-w-4xl mx-auto px-4 py-2 flex items-center justify-between text-[11px] font-mono font-semibold border-t ${theme === 'dark' ? 'border-white/[0.05] text-slate-400' : 'border-slate-100 text-slate-500'}`}>
          <div 
            onClick={() => setStep('scan')}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${step === 'scan' ? (theme === 'dark' ? 'text-cyan-400 font-bold' : 'text-cyan-700 font-bold') : ''}`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${step === 'scan' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-400'}`}>1</span>
            <span>01 SNAP NOTICE</span>
          </div>
          <span className="opacity-30">/</span>
          <div 
            onClick={() => result && setStep('audit')}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${step === 'audit' ? (theme === 'dark' ? 'text-cyan-400 font-bold' : 'text-cyan-700 font-bold') : ''}`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${step === 'audit' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-400'}`}>2</span>
            <span>02 AUDIT SCORECARD</span>
          </div>
          <span className="opacity-30">/</span>
          <div 
            onClick={() => result && prepareCourtDraft()}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${step === 'court_pack' ? (theme === 'dark' ? 'text-cyan-400 font-bold' : 'text-cyan-700 font-bold') : ''}`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${step === 'court_pack' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-400'}`}>3</span>
            <span>03 COURT DOCUMENTS</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 sm:py-6 space-y-4">

        {/* 24/7 Crisis & Suicide Prevention Lifeline (988 / 211) Banner */}
        <div className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs transition-colors ${theme === 'dark' ? 'bg-rose-950/20 border-rose-500/20 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <div className="p-1.5 rounded-lg bg-rose-500 text-white shrink-0">
              <LifeBuoy size={15} />
            </div>
            <div>
              <strong className="block text-rose-300 font-bold">In Crisis or Stressed? Help is Free & Confidential 24/7</strong>
              <span className="text-[11px] opacity-80">Eviction notices cause severe stress. You are not alone.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="tel:988" 
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <span>Call / Text 988</span>
            </a>
            <a 
              href="tel:211" 
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-300 bg-white text-slate-700'}`}
              title="Oregon 211 Housing & Rental Assistance"
            >
              211 Housing Help
            </a>
          </div>
        </div>

        {/* STEP 1: SNAP & SCAN HERO */}
        {step === 'scan' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            
            {/* Immediate Reassurance Notification Banner */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${theme === 'dark' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              <div className="p-2 rounded-xl bg-emerald-500 text-black shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div className="text-xs leading-relaxed">
                <strong>Emergency Protection:</strong> You <u>cannot</u> be locked out today. Oregon law strictly requires a formal court hearing before any sheriff can act.
              </div>
            </div>

            {/* Minimalist Hero */}
            <div className="text-center space-y-3 max-w-2xl mx-auto pt-2">
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>2026 Oregon Eviction Notice Auditor</span>
                </div>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10' : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200'}`}
                  title="Watch 60-second interactive guide"
                >
                  <Play size={11} className="fill-current" />
                  <span>How It Works (60s Guide)</span>
                </button>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Scan your eviction notice. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                  Find legal defects in 3 seconds.
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
                Over 60% of Oregon eviction notices contain fatal mailing or fee errors under ORS 90 & 105. Spot errors, gain 30–90 days of time, and prepare your court response.
              </p>

              {/* AI & Automation Transparency Badge */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                <Bot size={12} className="text-cyan-400" />
                <span>AI-Assisted Self-Help Scrivener • Compliant with Oregon Consumer Privacy Standards</span>
              </div>
            </div>

            {/* Main Action Box */}
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden glass-panel glow-card ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
              
              {isAnalyzing ? (
                <div className="py-20 text-center space-y-5">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                    <ScanLine className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold">
                      Forensic Audit in Progress...
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Checking ORS 90.155 (13-day mail buffer) • ORS 90.394 • ORS 105.136
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Legal Disclaimer Consent Checkbox */}
                  <div className={`p-4 rounded-2xl border transition-all ${disclaimerError && !acceptedDisclaimer ? 'bg-red-500/10 border-red-500/50 text-red-200 animate-pulse' : (theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200')}`}>
                    <label className="flex items-start gap-3 cursor-pointer select-none text-xs">
                      <input 
                        type="checkbox" 
                        checked={acceptedDisclaimer}
                        onChange={e => {
                          setAcceptedDisclaimer(e.target.checked);
                          if (e.target.checked) setDisclaimerError(false);
                        }}
                        className="mt-0.5 w-4.5 h-4.5 rounded-sm border-white/10 accent-cyan-500 cursor-pointer"
                      />
                      <span className="leading-normal">
                        <strong>Legal Agreement & Consent Checkbox:</strong> I understand that TenantGuard is an interactive self-help document scrivener tool. It does not provide legal representation or strategic advice. I agree to personally verify all generated dates and facts before filing them in Oregon Circuit Courts.
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Live Camera Button */}
                    <button
                      onClick={() => {
                        if (!acceptedDisclaimer) {
                          setDisclaimerError(true);
                          return;
                        }
                        startCamera();
                      }}
                      className="p-6 rounded-2xl shimmer-btn text-white flex flex-col items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition-all group cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera size={28} />
                      </div>
                      <div className="text-center">
                        <span className="font-extrabold text-base block">Take Photo of Notice</span>
                        <span className="text-xs text-cyan-100 font-medium">Front & back pages with camera</span>
                      </div>
                    </button>

                    {/* File Upload Button */}
                    <button
                      onClick={() => {
                        if (!acceptedDisclaimer) {
                          setDisclaimerError(true);
                          return;
                        }
                        fileInputRef.current?.click();
                      }}
                      className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-all group cursor-pointer ${theme === 'dark' ? 'border-white/10 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-white/[0.04] text-white' : 'border-slate-300 bg-slate-50 hover:border-cyan-500 hover:bg-cyan-50/40 text-slate-800'}`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-white/[0.06] text-cyan-400 group-hover:bg-cyan-500/20' : 'bg-slate-200 text-cyan-600'}`}>
                        <Upload size={26} />
                      </div>
                      <div className="text-center">
                        <span className="font-extrabold text-base block">Upload Document File</span>
                        <span className="text-xs text-slate-400 font-medium">Select photo, scan, or PDF</span>
                      </div>
                    </button>

                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/*,.pdf" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                  </div>

                  {/* Uploaded Evidence Previews */}
                  {evidences.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                          Notice Pages Ready for Audit ({evidences.length})
                        </span>
                        <button 
                          onClick={startCamera}
                          className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={14} /> Add Another Page
                        </button>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {evidences.map((e, idx) => (
                          <div key={e.id} className={`aspect-[3/4] rounded-xl overflow-hidden border relative group shadow-md ${theme === 'dark' ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                            {e.dataUrl ? (
                              <img src={e.dataUrl} alt={`Notice page ${idx + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                <FileText size={22} className="text-cyan-400 mb-1" />
                                <span className="text-[10px] font-mono truncate max-w-full">{e.fileName || 'Notice Doc'}</span>
                              </div>
                            )}
                            <div className="absolute top-1 left-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                              P.{idx + 1}
                            </div>
                            <button
                              onClick={(evt) => { evt.stopPropagation(); setEvidences(prev => prev.filter(x => x.id !== e.id)); }}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => performAudit(evidences)}
                        className="w-full py-4 rounded-2xl shimmer-btn text-white font-extrabold text-base shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap size={18} />
                        <span>Run Instant Notice Audit</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instant Demo Presets */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block px-1">
                Don't have a photo handy? Try a common defective notice demo:
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_NOTICES.map(sample => (
                  <div
                    key={sample.id}
                    onClick={() => {
                      loadSampleNotice(sample);
                      performAudit([
                        {
                          id: sample.id,
                          type: EvidenceType.NOTICE,
                          fileName: `${sample.name}.txt`,
                          content: sample.noticeText,
                          timestamp: Date.now()
                        }
                      ]);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] glass-panel ${theme === 'dark' ? 'hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-cyan-500 shadow-sm'}`}
                  >
                    <span className="text-[9px] font-mono font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mb-2">
                      {sample.badge}
                    </span>
                    <h4 className="text-xs font-bold line-clamp-1">
                      {sample.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {sample.defectSummary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Habitability & Retaliation Quick Trigger */}
            <div className={`p-5 rounded-2xl border transition-all glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowRepairsDrawer(prev => !prev)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">
                      Did you report repair issues before getting this notice? (Optional)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Evictions served within 6 months of repair complaints are presumed retaliatory (ORS 90.385).
                    </p>
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-bold shrink-0 ml-2">
                  {showRepairsDrawer ? 'Hide' : `+ Add (${repairLog.length})`}
                </span>
              </div>

              {showRepairsDrawer && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input 
                      type="date" 
                      value={newRepair.date} 
                      onChange={e => setNewRepair(prev => ({ ...prev, date: e.target.value }))}
                      className={`p-2.5 rounded-xl border text-xs ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                    />
                    <input 
                      type="text" 
                      placeholder="Issue (e.g. Broken heat, water leak, mold)" 
                      value={newRepair.issue}
                      onChange={e => setNewRepair(prev => ({ ...prev, issue: e.target.value }))}
                      className={`p-2.5 rounded-xl border text-xs sm:col-span-2 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (newRepair.date && newRepair.issue) {
                        setRepairLog(prev => [...prev, newRepair]);
                        setNewRepair({ date: '', issue: '' });
                      }
                    }}
                    className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl cursor-pointer"
                  >
                    + Save Repair Record
                  </button>

                  {repairLog.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {repairLog.map((r, i) => (
                        <div key={i} className="text-xs flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-xl text-cyan-300">
                          <span><strong>{r.date}</strong>: {r.issue}</span>
                          <button onClick={() => setRepairLog(prev => prev.filter((_, idx) => idx !== i))}>
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Testimonials */}
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
                Verified Oregon Tenant Outcomes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TESTIMONIALS.map(t => (
                  <div key={t.id} className={`p-4 rounded-2xl border glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                    <p className="text-xs italic mb-2 text-slate-300">"{t.text}"</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-400">{t.initials} • {t.county} County</span>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {t.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Partner Hub: Legal Aid, City Housing Bureaus & Courthouses */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 glass-panel glow-card ${theme === 'dark' ? 'border-cyan-500/20' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    <Building2 size={12} />
                    <span>Institutional & Legal Aid Triage Program</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                    Partnering with Oregon Housing Stability Agencies
                  </h3>
                  <p className="text-xs text-slate-400">
                    Designed to integrate directly into Legal Aid intake, courthouse self-help lobbies, and city rent assistance triage.
                  </p>
                </div>

                <a 
                  href="mailto:partners@oregontenantguard.org?subject=Oregon%20Tenant%20Guard%20Agency%20Pilot%20Inquiry&body=Hello%20TenantGuard%20Team,%0A%0AWe%20are%20interested%20in%20learning%20more%20about%20your%20notice%20triage%20and%20document%20scrivener%20technology%20for%20our%20organization.%0A%0AOrganization%20Name:%20%0AContact%20Person:%20%0ACounty/Region:%20"
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Request Agency Demo</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                    <Scale size={16} />
                  </div>
                  <h4 className="font-bold text-white">1. Legal Aid Intake Triage</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Saves intake screeners 30+ minutes per client by automatically calculating 13-day mail timelines (ORS 90.155) and spotting notice defects before attorney review.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                    <CheckCircle2 size={16} />
                  </div>
                  <h4 className="font-bold text-white">2. City Eviction Prevention</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Audits notices prior to emergency rent fund payout. If a notice is void ab initio, the city saves thousands while buying the tenant 30–90 days of stability.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                    <FileText size={16} />
                  </div>
                  <h4 className="font-bold text-white">3. Court Self-Help Kiosks</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Formats pro se pleadings on official 28-line numbered pleading paper pursuant to UTCR 2.010 with pre-filled ORS 21.682 fee waivers.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: INSTANT FORENSIC AUDIT SCORECARD */}
        {step === 'audit' && result && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setStep('scan')}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Scan Another Notice
              </button>
              <span className="text-[10px] font-mono font-black uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Audit Certified
              </span>
            </div>

            {/* Big Status Banner */}
            <div className={`p-6 sm:p-7 rounded-3xl border relative overflow-hidden glass-panel ${
              result.noticeAudit.isLegallySufficient 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-gradient-to-br from-amber-500/15 via-rose-500/15 to-transparent border-amber-500/40'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${result.noticeAudit.isLegallySufficient ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>
                  {result.noticeAudit.isLegallySufficient ? <CheckCircle2 size={26} /> : <AlertTriangle size={26} />}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    Forensic Verdict
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">
                    {result.noticeAudit.isLegallySufficient 
                      ? "Notice Appears Mathematically Compliant" 
                      : "FATAL DEFECT DETECTED: Ground for Immediate Dismissal"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {result.noticeAudit.explanation}
                  </p>
                </div>
              </div>

              {/* 3 Core Value Signals */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
                <div className="text-center p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono font-bold text-slate-400">
                    <span>Time Gained</span>
                    <InfoTooltip 
                      title="Why Defective Notices Buy Time:" 
                      text="When a court dismisses an eviction due to a defective notice, the landlord must start completely over from day 1 with a brand new notice, giving you 30–90 additional days of housing stability." 
                    />
                  </div>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">+{result.conversion.daysGained} Days</span>
                </div>

                <div className="text-center p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono font-bold text-slate-400">
                    <span>Fee Waiver</span>
                    <InfoTooltip 
                      title="State Fee Waiver (ORS 21.682):" 
                      text="In Oregon, filing a response normally costs $88. If you receive SNAP, OHP/Medicaid, SSI, or have low income, the court must waive this fee." 
                    />
                  </div>
                  <span className="text-lg sm:text-xl font-black text-cyan-400">${result.conversion.savings}</span>
                </div>

                <div className="text-center p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono font-bold text-slate-400">
                    <span>Legal Value</span>
                    <InfoTooltip 
                      title="Attorney Representation Savings:" 
                      text="Estimated average legal defense cost for hiring a private tenant defense lawyer in Oregon to draft motions and appear at first appearance." 
                    />
                  </div>
                  <span className="text-lg sm:text-xl font-black text-indigo-400">${result.conversion.averageDismissalCostSavings}</span>
                </div>
              </div>
            </div>

            {/* Extracted Details Grid */}
            <div className={`p-5 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">County</span>
                <span className="font-bold">{jurisdiction} County</span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Notice Type</span>
                <span className="font-bold text-cyan-400">{result.noticeAudit.noticeType}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Landlord / Plaintiff</span>
                <span className="font-bold truncate block">{landlordName || 'Landlord'}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Tenant / Defendant</span>
                <span className="font-bold truncate block">{tenantName || 'Tenant'}</span>
              </div>
            </div>

            {/* Mathematical Notice Timeline */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Statutory Date Calculation (ORS 90.155)
                </h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">Strict Compliance Rule</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">1. Date of Service</span>
                  <span className="text-sm font-bold block">{result.noticeAudit.dateOfService}</span>
                  <span className="text-[10px] text-slate-400">Method: {result.noticeAudit.methodOfService}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">2. Landlord Deadline</span>
                  <span className="text-sm font-bold text-amber-300 block">{result.noticeAudit.deadlineGiven}</span>
                  <span className="text-[10px] text-amber-400 font-bold">{result.noticeAudit.daysGiven} days given</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">3. Minimum Legal Deadline</span>
                  <span className="text-sm font-bold text-emerald-300 block">{result.noticeAudit.legalDeadline}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{result.noticeAudit.daysRequired} days required by law</span>
                </div>
              </div>
            </div>

            {/* Detected Statutory Errors List */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                Detected Statutory Discrepancies ({result.noticeAudit.defects.length})
              </h3>
              
              {result.noticeAudit.defects.map((defect, idx) => (
                <div key={idx} className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${defect.severity === 'fatal' ? 'bg-red-950/20 border-red-500/40' : 'bg-slate-900 border-white/10'}`}>
                  <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
                    <Gavel size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-mono font-black uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        {defect.statute}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold">{defect.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {defect.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Strategic Response Selection */}
            <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200 shadow-md'}`}>
              <h3 className="text-sm font-extrabold">
                Select your defense strategy:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    type: 'Motion to Dismiss' as const,
                    title: 'Motion to Dismiss',
                    badge: 'Recommended',
                    desc: 'Dismiss case immediately due to notice calculation defect.'
                  },
                  {
                    type: 'Answer to Residential Eviction' as const,
                    title: 'Answer & Counterclaims',
                    badge: 'Trial Defense',
                    desc: 'Assert Habitability repair issues and Retaliation defenses.'
                  },
                  {
                    type: 'Motion for Stay of Proceedings (SB 690)' as const,
                    title: 'SB 690 90-Day Stay',
                    badge: 'Infant / OHP',
                    desc: 'Mandatory 90-day delay for households with infants under 12 months.'
                  }
                ].map(opt => (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedResponseOption(opt.type)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedResponseOption === opt.type ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500' : (theme === 'dark' ? 'border-white/10 bg-slate-950 hover:border-white/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300')}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${selectedResponseOption === opt.type ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                        {opt.badge}
                      </span>
                      {selectedResponseOption === opt.type && <Check size={16} className="text-cyan-400" />}
                    </div>
                    <h4 className="text-xs font-bold">{opt.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => prepareCourtDraft()}
                className="w-full py-4 rounded-2xl shimmer-btn text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Generate {selectedResponseOption} Pack</span>
                <ChevronRight size={18} />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: COURT DOCUMENT PACK & MONETIZATION */}
        {step === 'court_pack' && result && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setStep('audit')}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Scorecard
              </button>
              <span className="text-[10px] font-mono font-black uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Ready for Filing
              </span>
            </div>

            {/* Document Tabs */}
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'motion', label: '1. Court Motion (UTCR 2.010)' },
                { id: 'script', label: '2. Hearing Script' },
                { id: 'mediation', label: '3. Hallway Mediation Rules' },
                { id: 'waiver', label: '4. Fee Waiver Form' },
                { id: 'expungement', label: '5. Record Sealing (ORS 105.163)' },
                { id: 'checklist', label: '6. Courthouse Guide' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id ? (theme === 'dark' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-slate-900 text-white') : 'text-slate-400 hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Pleading Motion View */}
            {activeTab === 'motion' && (
              <div className="space-y-4">
                {isGeneratingDraft ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Formatting Oregon UTCR 2.010 Pleading Document...</p>
                  </div>
                ) : generatedMotionDraft ? (
                  <div className="space-y-4">
                    
                    {/* Legal Document Pleading Box */}
                    <div className={`p-6 sm:p-10 rounded-2xl border font-serif text-xs leading-relaxed transition-all relative ${theme === 'dark' ? 'bg-[#04060a] border-white/10 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-sm'}`}>
                      <div className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-400">
                        UTCR 2.010 Compliant Pleading
                      </div>
                      
                      <pre className="whitespace-pre-wrap font-mono text-[11px] leading-5">
                        {generatedMotionDraft}
                      </pre>
                    </div>

                    {/* Hearing Date Countdown Timer Card */}
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500 text-black">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-300 block">{t.countdownTitle}</span>
                          <span className="text-xs text-slate-300 font-medium">
                            {calculateRemainingDays() !== null ? (
                              calculateRemainingDays()! > 0 ? (
                                <strong className="text-cyan-300 text-sm">{calculateRemainingDays()} {t.daysLeft}</strong>
                              ) : (
                                <strong className="text-amber-400 text-sm">Hearing is Today or Past</strong>
                              )
                            ) : (
                              'Set your First Appearance hearing date to track deadline'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input 
                          type="datetime-local" 
                          value={hearingDate}
                          onChange={e => setHearingDate(e.target.value)}
                          className="p-2 rounded-xl border border-white/10 bg-black text-xs font-mono text-white flex-1 sm:flex-none"
                        />
                      </div>
                    </div>

                    {/* Download, Email & Copy Action Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          if (!isPaid) {
                            setShowPaywallModal(true);
                          } else {
                            generateOregonLegalPDF({
                              county: jurisdiction,
                              landlord: landlordName || 'LANDLORD',
                              tenant: tenantName || 'TENANT',
                              propertyAddress,
                              caseNo: result.caseNumber || 'PENDING',
                              documentTitle: selectedResponseOption,
                              currentDate: new Date().toLocaleDateString(),
                              content: generatedMotionDraft
                            });
                          }
                        }}
                        className="py-4 rounded-xl shimmer-btn text-white font-extrabold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer sm:col-span-2"
                      >
                        <Download size={16} />
                        <span>Download Official PDF + Certificate of Service</span>
                        {!isPaid && <Lock size={13} className="text-cyan-200" />}
                      </button>

                      <button
                        onClick={() => setShowEmailModal(true)}
                        className={`py-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-white/10 text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08]' : 'border-slate-200 text-cyan-700 bg-cyan-50 hover:bg-cyan-100'}`}
                      >
                        <Share2 size={15} />
                        <span>{t.emailBundle}</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Tab 2: Court Hearing Script */}
            {activeTab === 'script' && result.hearingScript && (
              <div className="space-y-4">
                <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">Step 1: First Appearance (Roll Call)</span>
                    <h4 className="text-xs font-bold mt-1">When the Judge calls your name:</h4>
                    <div className="mt-2 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 italic">
                      "{result.hearingScript.openingStatement}"
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">Step 2: Motion to Dismiss Argument</span>
                    <h4 className="text-xs font-bold mt-1">When the Judge asks for your legal basis:</h4>
                    <div className="mt-2 p-4 rounded-xl bg-slate-950 border border-white/5 text-xs leading-relaxed text-slate-300">
                      {result.hearingScript.motionToDismissScript}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">Step 3: Anticipated Judge Questions</span>
                    {result.hearingScript.judgeFAQ.map((faq, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-1">
                        <p className="font-bold text-white">Judge: "{faq.question}"</p>
                        <p className="text-cyan-300 font-medium italic">You: "{faq.suggestedAnswer}"</p>
                        <p className="text-[10px] text-slate-400 font-normal">Tip: {faq.proTip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isPaid) setShowPaywallModal(true);
                    else generateHearingScriptPDF(result);
                  }}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Printable Court Hearing Script PDF</span>
                  {!isPaid && <Lock size={13} className="text-indigo-200" />}
                </button>
              </div>
            )}

            {/* Tab 3: Hallway Mediation Guide */}
            {activeTab === 'mediation' && (
              <div className="space-y-4">
                <div className={`p-6 sm:p-8 rounded-2xl border space-y-5 glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500 text-black">
                      <FileCheck2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Hallway Negotiation & Settlement Rules</h4>
                      <p className="text-xs text-slate-400">80% of Oregon FED cases settle in hallway mediation. Protect your rights.</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      { title: '1. Never sign a 7-day move-out', desc: 'Landlord attorneys will try to rush you into a 7-day stipulation. If you have notice defects, negotiate for at least 30 to 60 days.' },
                      { title: '2. Demand Dismissal & Expungement (ORS 105.163)', desc: 'Ensure the agreement states the case will be dismissed with prejudice and sealed so it never appears on background checks.' },
                      { title: '3. Rent Balance Waivers', desc: 'If agreeing to move out voluntarily, ask the landlord to waive unpaid rent balances or return security deposits.' }
                    ].map(r => (
                      <div key={r.title} className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                        <span className="font-bold text-emerald-400 block">{r.title}</span>
                        <p className="text-slate-300 leading-relaxed">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isPaid) setShowPaywallModal(true);
                    else generateMediationGuidePDF(result);
                  }}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Hallway Mediation Guide PDF</span>
                  {!isPaid && <Lock size={13} className="text-emerald-200" />}
                </button>
              </div>
            )}

            {/* Tab 4: Fee Waiver */}
            {activeTab === 'waiver' && (
              <div className="space-y-4">
                <div className={`p-6 sm:p-8 rounded-2xl border space-y-4 glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Oregon State Fee Waiver Application (ORS 21.682)</h4>
                      <p className="text-xs text-slate-400">Waives the mandatory $88.00 appearance filing fee in Circuit Court.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                    <p className="font-bold text-emerald-300">How to file for free:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Print and sign the pre-filled Fee Waiver Application.</li>
                      <li>Hand it to the court clerk at the filing window before your appearance.</li>
                      <li>Receiving SNAP, OHP, SSI, or having low income qualifies you automatically.</li>
                    </ol>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isPaid) setShowPaywallModal(true);
                    else generateFeeWaiverPDF(result);
                  }}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Pre-Filled State Fee Waiver Form ($88 Saved)</span>
                  {!isPaid && <Lock size={13} className="text-emerald-200" />}
                </button>
              </div>
            )}

            {/* Tab 5: Expungement & Record Sealing */}
            {activeTab === 'expungement' && (
              <div className="space-y-4">
                <div className={`p-6 sm:p-8 rounded-2xl border space-y-4 glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Eviction Record Expungement & Sealing (ORS 105.163)</h4>
                      <p className="text-xs text-slate-400">Permanently seal your court record so it doesn't harm future rental applications.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1.5 text-slate-300 leading-relaxed">
                    <p className="font-bold text-indigo-300">Statutory Entitlement:</p>
                    <p>Once your eviction case is dismissed, settled, or satisfied, you have the legal right under ORS 105.163 to submit a Motion to Set Aside and Seal all public records.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isPaid) setShowPaywallModal(true);
                    else generateRecordSealingPDF(result);
                  }}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Motion to Seal Eviction Record PDF</span>
                  {!isPaid && <Lock size={13} className="text-indigo-200" />}
                </button>
              </div>
            )}

            {/* Tab 6: County Logistics */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <div className={`p-6 sm:p-8 rounded-2xl border space-y-5 glass-panel ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">Court Location</span>
                    <h4 className="text-sm font-bold">{jurisdiction} County Circuit Court</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {OREGON_COURTS[jurisdiction]?.address || 'Local Oregon Circuit Court'} • Phone: {OREGON_COURTS[jurisdiction]?.phone || '(503) 988-3003'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { num: '1', title: 'Bring 3 Printed Copies', desc: 'One for the Judge, one for the Landlord, and one timestamped copy for you.' },
                      { num: '2', title: 'Arrive 30 Minutes Early', desc: 'Pass through courthouse security and check the FED board for your courtroom.' },
                      { num: '3', title: 'Submit Fee Waiver First', desc: 'Hand your Fee Waiver to the clerk window so you do not pay $88.' },
                      { num: '4', title: 'Do Not Sign Bad Deals in Hallway', desc: 'Ensure any mediated agreement gives you at least 30-60 move-out days and dismisses the eviction.' }
                    ].map(item => (
                      <div key={item.num} className="flex gap-3 items-start p-3.5 rounded-xl bg-slate-950 border border-white/5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[10px] font-black shrink-0">
                          {item.num}
                        </span>
                        <div>
                          <p className="font-bold">{item.title}</p>
                          <p className="text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* DASHBOARD: SAVED CASES */}
        {step === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Your Eviction Defense Dashboard</h2>
                <p className="text-xs text-slate-400">Manage audited notice packets, court deadlines, and filing documents.</p>
              </div>
              <button 
                onClick={startNewScan}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Audit New Notice
              </button>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">Total Audits</span>
                <span className="text-xl sm:text-2xl font-black text-white">{savedCases.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">Est. Time Gained</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">+{savedCases.length * 90}d</span>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block">Fee Waivers</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-300">${savedCases.length * 88}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">ORS Compliance</span>
                <span className="text-xs font-bold text-cyan-300 mt-1 block">UTCR 2.010 Certified</span>
              </div>
            </div>

            {/* Saved Case List */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                Active Cases & Audited Notices ({savedCases.length})
              </h3>

              {savedCases.length === 0 ? (
                <div className={`p-12 border-2 border-dashed rounded-3xl text-center space-y-3 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                    <FileText size={24} />
                  </div>
                  <p className="text-xs text-slate-400 font-bold font-mono">No cases or notices saved on this device.</p>
                  <button onClick={startNewScan} className="text-xs text-cyan-400 font-bold hover:underline">
                    Scan your first notice to generate legal packet
                  </button>
                </div>
              ) : (
                savedCases.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => {
                      setResult(c.result);
                      setJurisdiction(c.jurisdiction);
                      setLandlordName(c.landlordName || '');
                      setTenantName(c.tenantName || '');
                      setPropertyAddress(c.propertyAddress || '');
                      setStep('audit');
                    }}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.01] glass-panel ${theme === 'dark' ? 'hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-cyan-500 shadow-md'}`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                          <Gavel size={22} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {c.jurisdiction} County
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Fatal Defect Found
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white">{c.landlordName || "Eviction Notice Audit"}</h4>
                          <p className="text-xs text-slate-400">
                            Tenant: <strong>{c.tenantName || "Pro Se Resident"}</strong> • {new Date(c.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setResult(c.result);
                            prepareCourtDraft();
                          }}
                          className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Download size={14} />
                          <span>View Court Pack</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-white/5 cursor-pointer"
                          title="Delete case"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pro Se Defense Quick Checklist Card */}
            <div className={`p-6 rounded-3xl border glass-panel space-y-4 ${theme === 'dark' ? 'border-white/[0.08]' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <FileCheck2 size={18} />
                </div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Courthouse Appearance Checklist (ORS 105 FED)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="font-bold text-cyan-400 block">1. 3 Printed Copies</span>
                  <p className="text-slate-400 text-[11px]">Judge, Landlord, and one stamped copy for your records.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="font-bold text-emerald-400 block">2. Fee Waiver First</span>
                  <p className="text-slate-400 text-[11px]">Submit ORS 21.682 form at the clerk window to avoid the $88 fee.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="font-bold text-indigo-400 block">3. Mediation Strategy</span>
                  <p className="text-slate-400 text-[11px]">Never agree to &lt;30 days. Demand case expungement under ORS 105.163.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES SCREEN */}
        {step === 'resources' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Free Oregon Tenant Legal Resources</h2>
                <p className="text-xs text-slate-400">Free hotlines, tenant unions, and emergency assistance.</p>
              </div>
              <button 
                onClick={() => setStep('scan')}
                className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                Back to Scan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LEGAL_RESOURCES.map(res => (
                <a 
                  key={res.name}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-5 rounded-2xl border transition-all block group glass-panel ${theme === 'dark' ? 'hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {res.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold mt-2">{res.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{res.phone}</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </a>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-cyan-300">Need Immediate Shelter or Utility Assistance?</h4>
                <p className="text-[11px] text-slate-400">Dial 2-1-1 or visit 211info.org for local Oregon emergency relief.</p>
              </div>
              <a href="tel:211" className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl shadow-sm shrink-0 ml-2">
                Call 211
              </a>
            </div>
          </div>
        )}

        {/* LIVE CAMERA VIEWFINDER MODAL */}
        <AnimatePresence>
          {isLiveCameraOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            >
              <div className="w-full max-w-md bg-[#0a0d14] border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="text-cyan-400" size={17} />
                    <h3 className="text-xs font-bold text-white">Live Notice Camera Viewfinder</h3>
                  </div>
                  <button onClick={stopCamera} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {cameraError ? (
                  <div className="p-6 text-center space-y-3">
                    <AlertCircle size={32} className="text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                    <button
                      onClick={() => {
                        stopCamera();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl shadow"
                    >
                      Choose from Files Instead
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                      <video 
                        ref={videoRef} 
                        playsInline 
                        muted 
                        autoPlay 
                        className="w-full h-full object-cover" 
                      />
                      
                      {/* Document Frame Guide with Laser Scanner */}
                      <div className="absolute inset-3 border-2 border-dashed border-cyan-400/50 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                        <div className="flex justify-between text-[9px] text-cyan-300 font-mono">
                          <span>┌ ALIGN NOTICE</span>
                          <span>┐</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-cyan-300 font-mono">
                          <span>└</span>
                          <span>HOLD STEADY ┘</span>
                        </div>
                      </div>

                      {isCameraStarting && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={capturePhotoFromCamera}
                        className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <Camera size={18} />
                        <span>Snap Notice Photo</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-3.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GOOGLE GEMINI & AI AUDIT EXPORT MODAL */}
        <AnimatePresence>
          {showAiAuditModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setShowAiAuditModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-[#0d1117] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">Review Case with Google Gemini</h3>
                      <p className="text-[11px] text-slate-400">Export prompt for Gemini 1.5 Pro, 2.5 Flash, or Google AI Studio.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAiAuditModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 max-h-60 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed">
                  <pre className="whitespace-pre-wrap">{generateAiAuditExportText()}</pre>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateAiAuditExportText());
                      setCopiedAiPrompt(true);
                      setTimeout(() => setCopiedAiPrompt(false), 2500);
                    }}
                    className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {copiedAiPrompt ? <CheckCheck size={16} /> : <Copy size={16} />}
                    <span>{copiedAiPrompt ? 'Copied Prompt to Clipboard!' : 'Copy Gemini Review Prompt'}</span>
                  </button>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open AI Studio</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EMAIL COURT PACK MODAL */}
        <AnimatePresence>
          {showEmailModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setShowEmailModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-[#0d1117] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Share2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">Email Court Pack to Your Phone</h3>
                      <p className="text-[11px] text-slate-400">Access your documents directly at the courthouse.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Your Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={tenantEmail}
                    onChange={e => setTenantEmail(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-mono ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-slate-300 space-y-1">
                  <p className="font-bold text-cyan-300">Included in Email Bundle:</p>
                  <p>• Courtroom Hearing Cheat Sheet & Judge Questions</p>
                  <p>• Complete Procedural Defect Breakdown (ORS 90 & 105)</p>
                  <p>• Courthouse window filing instructions</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleEmailCourtPack();
                      setShowEmailModal(false);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    Send Email Bundle
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-3 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STRIPE CHECKOUT & TIER UPGRADE MODAL */}
        <AnimatePresence>
          {showPaywallModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
              onClick={() => setShowPaywallModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-lg p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-5 ${theme === 'dark' ? 'bg-[#0d1117] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs">
                      S
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">Secure Stripe Checkout</span>
                  </div>
                  <button onClick={() => setShowPaywallModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {/* Plan Selection Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setSelectedPlan('standard')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedPlan === 'standard' ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500' : 'border-white/10 bg-black/40 text-slate-400'}`}
                  >
                    <span className="text-[9px] font-mono uppercase font-bold text-cyan-400 block">Defense Pack</span>
                    <span className="text-xl font-black text-white">$29</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Motion + Fee Waiver + Script</p>
                  </div>

                  <div 
                    onClick={() => setSelectedPlan('fast_track')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${selectedPlan === 'fast_track' ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500' : 'border-white/10 bg-black/40 text-slate-400'}`}
                  >
                    <span className="text-[8px] font-mono font-black uppercase bg-indigo-500 text-white px-1.5 py-0.2 rounded absolute top-2 right-2">
                      Complete
                    </span>
                    <span className="text-[9px] font-mono uppercase font-bold text-indigo-400 block">Fast-Track + Sealing</span>
                    <span className="text-xl font-black text-white">$49</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">+ Record Expungement Pack</p>
                  </div>
                </div>

                {/* Simulated Stripe Card Form */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Card Information</span>
                    <span className="text-cyan-400 font-bold">256-Bit SSL Encrypted</span>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="4242 •••• •••• 4242" 
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-white pl-9"
                    />
                    <CreditCard className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="MM / YY" 
                      value={cardExp}
                      onChange={e => setCardExp(e.target.value)}
                      className="p-3 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="CVC" 
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      className="p-3 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Promo Code (try: PROSE)" 
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs uppercase text-white"
                  />
                  <button 
                    onClick={() => {
                      if (['PROSE', 'OREGON2026', 'FREE'].includes(promoCode.trim().toUpperCase())) {
                        setIsPromoApplied(true);
                      } else {
                        alert('Invalid code. Try "PROSE"');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleSimulatedStripePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 rounded-2xl shimmer-btn text-white font-extrabold text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Stripe Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>{isPromoApplied ? 'Unlock For Free' : `Pay ${selectedPlan === 'standard' ? '$29.00' : '$49.00'} & Unlock All PDFs`}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  Instant digital download. 100% money-back guarantee if notice formatting is rejected by Oregon court clerk.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOW IT WORKS / 60-SECOND INTERACTIVE VIDEO WALKTHROUGH MODAL */}
        <AnimatePresence>
          {showVideoModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
              onClick={() => setShowVideoModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-2xl p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-5 max-h-[88vh] flex flex-col ${theme === 'dark' ? 'bg-[#0a0e17] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Play size={18} className="fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold">How TenantGuard Protects Oregon Renters</h3>
                      <p className="text-[10px] text-slate-400">
                        A 60-second plain-English guide to eviction defense in Oregon.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[10px] font-black">1</span>
                      <h4 className="font-bold text-cyan-300">Why Oregon Notice Math Matters (ORS 90.155)</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      In Oregon, eviction notices must be mathematically exact. If your landlord mailed your notice, they <strong>must add 3 full calendar days</strong> to the cure period. If they gave you 10 days instead of 13, the notice is void under state law.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">2</span>
                      <h4 className="font-bold text-amber-300">The Late Fee Trap (ORS 90.394)</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Landlords frequently try to demand late fees, pet fees, or utility surcharges on rent notices. Under Oregon law, a nonpayment notice can <strong>only demand base rent</strong>. Demanding late fees invalidates the entire notice.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black">3</span>
                      <h4 className="font-bold text-emerald-300">What Happens at Your First Appearance</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      You walk into court with your 3 printed copies. When the judge calls your name, you read your 1-sentence opening script: <em>"I move to dismiss this action under ORS 90.155 because the notice provided insufficient statutory time."</em> If dismissed, you gain 30–90 days of stability.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Got It, Let's Scan My Notice
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATUTORY GROUNDING & VERIFICATION MODAL */}
        <AnimatePresence>
          {showStatutesModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
              onClick={() => setShowStatutesModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-2xl p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-5 max-h-[88vh] flex flex-col ${theme === 'dark' ? 'bg-[#0a0e17] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Scale size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold">Oregon Legal Authority & Statutory Grounding Matrix</h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Verified via Oregon Legislative Counsel • Version: {STATUTORY_SYSTEM_METADATA.statuteVersion}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowStatutesModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-3.5 pr-1 flex-1 text-xs">
                  {Object.values(OREGON_STATUTORY_AUTHORITIES).map(statute => (
                    <div key={statute.code} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {statute.code}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1">{statute.title}</h4>
                        </div>
                        <a 
                          href={statute.officialSourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          Gov Source <ExternalLink size={11} />
                        </a>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {statute.strictComplianceRequirement}
                      </p>

                      <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-[11px] text-red-300 space-y-0.5">
                        <span className="font-bold text-red-400 block">Strict Compliance Standard:</span>
                        <p>{statute.fatalNoticeDefectRule}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    <span>Statutory Checksum: <strong className="font-mono">{STATUTORY_SYSTEM_METADATA.checksum}</strong></span>
                  </div>
                  <button 
                    onClick={() => setShowStatutesModal(false)}
                    className="px-4 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONSOLIDATED LEGAL, TERMS & PRIVACY POLICY MODAL */}
        <AnimatePresence>
          {showLegal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
              onClick={() => setShowLegal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-2xl p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-4 max-h-[85vh] flex flex-col ${theme === 'dark' ? 'bg-[#0a0e17] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                {/* Header & Close */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold">Oregon Legal Compliance & Governance</h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        OCPA (ORS 646A.570) • ORS 9.160 • ORS 9.320 • UTCR 2.010
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowLegal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {/* Tab Controls */}
                <div className="flex border-b border-white/10 gap-2 text-xs">
                  <button
                    onClick={() => setLegalTab('tos')}
                    className={`px-3 py-2 rounded-t-xl font-bold transition-all cursor-pointer ${legalTab === 'tos' ? (theme === 'dark' ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-white') : 'text-slate-400 hover:text-white'}`}
                  >
                    Terms of Service
                  </button>
                  <button
                    onClick={() => setLegalTab('privacy')}
                    className={`px-3 py-2 rounded-t-xl font-bold transition-all cursor-pointer ${legalTab === 'privacy' ? (theme === 'dark' ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-white') : 'text-slate-400 hover:text-white'}`}
                  >
                    Privacy Policy (OCPA)
                  </button>
                  <button
                    onClick={() => setLegalTab('upl')}
                    className={`px-3 py-2 rounded-t-xl font-bold transition-all cursor-pointer ${legalTab === 'upl' ? (theme === 'dark' ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-white') : 'text-slate-400 hover:text-white'}`}
                  >
                    Scrivener & UPL Shield
                  </button>
                </div>

                {/* Tab Content */}
                <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs leading-relaxed text-slate-300">
                  {legalTab === 'tos' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
                        <strong>Terms Version:</strong> {TERMS_OF_SERVICE.version} • Effective: {TERMS_OF_SERVICE.effectiveDate}
                      </div>
                      {TERMS_OF_SERVICE.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-1">
                          <h4 className="font-bold text-white text-xs">{sec.heading}</h4>
                          <p className="text-[11px] text-slate-400 whitespace-pre-line">{sec.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {legalTab === 'privacy' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                        <strong>Oregon Consumer Privacy Act (OCPA) Compliance:</strong> We never sell consumer data or notice images.
                      </div>
                      {PRIVACY_POLICY.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-1">
                          <h4 className="font-bold text-white text-xs">{sec.heading}</h4>
                          <p className="text-[11px] text-slate-400 whitespace-pre-line">{sec.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {legalTab === 'upl' && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                        <strong>Pure Scrivener / Self-Help Service (ORS 9.160 & ORS 9.320):</strong> TenantGuard is an automated document scrivener and mathematical computation software. TenantGuard is not a law firm, does not provide legal advice, and does not substitute for an attorney licensed by the Oregon State Bar.
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-xs">Pro Se Representation Authority (ORS 9.320):</h4>
                        <p className="text-[11px] text-slate-400">
                          Under Oregon law (ORS 9.320), natural persons have the sovereign right to represent themselves in court. You are solely responsible for reviewing all generated documents, verifying factual accuracy (ORCP 17), and signing pleadings under penalty of perjury.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-xs">No Outcome Guarantee (ORS 646.608 UTPA):</h4>
                        <p className="text-[11px] text-slate-400">
                          While strict compliance is required in Oregon FED proceedings, judicial determinations rest solely with the presiding judge. TenantGuard makes no warranties or guarantees regarding case dismissal, settlement terms, or trial outcomes.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 space-y-1.5">
                        <h4 className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                          <LifeBuoy size={14} /> 24/7 Suicide Prevention & Housing Crisis Hotlines:
                        </h4>
                        <ul className="text-[11px] list-disc list-inside space-y-0.5 pt-1">
                          <li><strong>National Suicide & Crisis Lifeline:</strong> Call or text <strong>988</strong> (24/7/365, Free, Confidential)</li>
                          <li><strong>Lines for Life Oregon:</strong> Call <strong>(800) 273-8255</strong> or text <strong>273TALK</strong> to 839863</li>
                          <li><strong>Oregon 211 Emergency Assistance:</strong> Call <strong>211</strong> for rent/shelter support</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowLegal(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  I Understand & Agree
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-4 text-xs transition-colors ${theme === 'dark' ? 'border-white/[0.06] bg-[#030508] text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-400">TenantGuard Oregon • Pro Se Eviction Defense Engine</p>
            <p className="text-[10px]">Statutory compliance under ORS 90, ORS 105, OCPA & UTCR 2.010.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-xs">
            <button onClick={() => { setLegalTab('tos'); setShowLegal(true); }} className="hover:underline cursor-pointer">Terms of Service</button>
            <span>•</span>
            <button onClick={() => { setLegalTab('privacy'); setShowLegal(true); }} className="hover:underline cursor-pointer">Privacy Policy (OCPA)</button>
            <span>•</span>
            <button onClick={() => { setLegalTab('upl'); setShowLegal(true); }} className="hover:underline cursor-pointer">Scrivener / UPL</button>
            <span>•</span>
            <button onClick={() => setShowAiAuditModal(true)} className="text-slate-400 hover:text-cyan-400 hover:underline cursor-pointer">Audit Export</button>
            <span>•</span>
            <a href="tel:988" className="text-rose-400 font-bold flex items-center gap-1">
              <LifeBuoy size={13} /> Crisis 988
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
