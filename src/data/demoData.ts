import { AnalysisRecord, AlertItem, DashboardStats } from '../types';

export const INITIAL_DEMO_ANALYSES: AnalysisRecord[] = [
  {
    id: 'demo-misinfo-1',
    module: 'misinformation',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    title: '5G Cellular Radiation & Viral Transmission Conspiracy Post',
    sourceType: 'text',
    rawInputSnippet:
      'BREAKING: Leaked confidential research shows 5G microwave towers are actively lowering human hemoglobin oxygen absorption and directly transmitting synthetic pathogens into urban populations. Mainstream media is colluding with telecom giants to hide this global emergency!',
    classification: 'Likely Misinformation',
    riskLevel: 'Critical',
    riskScore: 94,
    confidenceScore: 96,
    sensationalismIndex: 92,
    linguisticTone: 'Highly sensationalized, conspiratorial urgency, unsubstantiated medical claims',
    explanation:
      'The text contains multiple scientifically debunked claims linking electromagnetic spectrum radiation (5G RF) to viral or cellular pathogens. Radio frequencies used in telecommunications are non-ionizing and biologically incapable of generating or transmitting microbiological pathogens.',
    keyFactors: [
      'Unsubstantiated causal link between non-ionizing RF and pathogens',
      'Hallmarks of viral conspiratorial language ("leaked confidential research", "colluding")',
      'Absence of empirical citations or peer-reviewed literature',
      'High emotional arousal appeals designed to trigger panic sharing'
    ],
    claims: [
      {
        id: 'c1',
        claimText: '5G towers directly transmit synthetic pathogens into urban populations',
        veracityScore: 4,
        status: 'False',
        evidenceSummary: 'Pathogens are biological biological entities (viruses, bacteria) requiring cellular reproduction; RF electromagnetic fields cannot transmit physical microorganisms.',
        needsFactCheck: true,
        suggestedSources: ['WHO International EMF Project', 'IEEE Standards Association', 'CDC Public Health Guidelines']
      },
      {
        id: 'c2',
        claimText: '5G microwaves lower human hemoglobin oxygen absorption rates',
        veracityScore: 8,
        status: 'False',
        evidenceSummary: 'Standard 5G operating bands (sub-6 GHz and mmWave) do not ionize molecules or chemically alter blood heme complexes.',
        needsFactCheck: true,
        suggestedSources: ['FDA Radiation-Emitting Products Evaluation', 'Nature Scientific Reports']
      }
    ],
    isDemo: true
  },
  {
    id: 'demo-violence-1',
    module: 'violence',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    title: 'High-Density Physical Altercation / Public Brawl Video',
    sourceType: 'video',
    rawInputSnippet: 'Surveillance feed scan: 1080p 30fps security camera stream at public transit concourse.',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    classification: 'Fighting',
    riskLevel: 'High',
    riskScore: 88,
    confidenceScore: 91,
    explanation:
      'Computer vision multi-frame motion and posture analysis detected rapid closed-fist kinematic strikes, aggressive forward lunge trajectories, and multiple individuals engaged in close-quarter physical struggle with abrupt ground falls.',
    keyFactors: [
      'Kinematic velocity spikes matching aggressive strike patterns',
      'Body joint angle disorientation indicating tackles and falls',
      'Crowd dispersal pattern around the epicenter of conflict',
      'Multiple actors engaged in rapid non-cooperative contact'
    ],
    detectedObjects: ['Human Figures (4)', 'Ground Impact Zones', 'Rapid Motion Blur'],
    threatIndicators: ['Rapid Striking Motion', 'Physical Grappling', 'Crowd Panic Retreat'],
    frameDetections: [
      {
        timestampSeconds: 1.2,
        frameIndex: 36,
        category: 'Normal / Safe',
        riskScore: 12,
        confidence: 94,
        visualIndicators: ['Pedestrian flow normal', 'Stationary posture']
      },
      {
        timestampSeconds: 3.8,
        frameIndex: 114,
        category: 'Aggressive Activity',
        riskScore: 68,
        confidence: 86,
        visualIndicators: ['Sudden physical approach', 'Raised arm gestures', 'Verbal/postural confrontation']
      },
      {
        timestampSeconds: 5.4,
        frameIndex: 162,
        category: 'Fighting',
        riskScore: 92,
        confidence: 93,
        visualIndicators: ['Direct closed-fist impact', 'Person tackled to ground', 'Secondary combatant joining']
      },
      {
        timestampSeconds: 7.1,
        frameIndex: 213,
        category: 'Physical Assault',
        riskScore: 89,
        confidence: 90,
        visualIndicators: ['Continuous ground strikes', 'Bystander flee motion vectors']
      }
    ],
    isDemo: true
  },
  {
    id: 'demo-misinfo-2',
    module: 'misinformation',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    title: 'NASA James Webb Space Telescope Exoplanet Discovery Press Release',
    sourceType: 'text',
    rawInputSnippet:
      'NASA astronomers utilizing the James Webb Space Telescope NIRSpec instrument have detected carbon dioxide and methane in the atmosphere of habitable-zone exoplanet K2-18b. Further spectroscopic observation cycles are planned to verify potential dimethyl sulfide biosignatures.',
    classification: 'Likely Reliable',
    riskLevel: 'Low',
    riskScore: 6,
    confidenceScore: 95,
    sensationalismIndex: 8,
    linguisticTone: 'Objective, scientific, measured, transparent regarding preliminary status',
    explanation:
      'The text uses verified scientific terminology, attributes precise spectroscopic instruments (NIRSpec), accurately summarizes the published peer-reviewed findings in The Astrophysical Journal Letters, and appropriately qualifies secondary biosignature hypotheses without hyperbole.',
    keyFactors: [
      'Accurate attribution to verified scientific instrumentation',
      'Appropriate epistemic humility regarding unconfirmed potential biosignatures',
      'Consistent with NASA Goddard Space Flight Center official announcements',
      'No coercive viral incentives or sensationalist distortion'
    ],
    claims: [
      {
        id: 'c3',
        claimText: 'James Webb NIRSpec detected carbon dioxide and methane on K2-18b',
        veracityScore: 98,
        status: 'Verified',
        evidenceSummary: 'Confirmed by published spectra in Astrophysical Journal Letters (Madhusudhan et al., Sept 2023).',
        needsFactCheck: false,
        suggestedSources: ['NASA Webb Science Release', 'Astrophysical Journal Letters', 'ESA Science Hub']
      }
    ],
    isDemo: true
  },
  {
    id: 'demo-violence-2',
    module: 'violence',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    title: 'Public Demonstration & Law Enforcement Standoff Scan',
    sourceType: 'image',
    rawInputSnippet: 'Field photograph: Gathering near civic center perimeter with security barriers.',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    classification: 'Aggressive Activity',
    riskLevel: 'Moderate',
    riskScore: 62,
    confidenceScore: 84,
    explanation:
      'Visual analysis identified tense crowd dynamics, defensive riot shield postures by protective personnel, and elevated barrier pressure, but no active kinetic assault or discharged weaponry in the current frame.',
    keyFactors: [
      'Protective gear and barrier perimeter detected',
      'Dense gathering with heightened posture indicators',
      'No active kinetic striking or weapon discharge observed',
      'Requires human situational monitoring'
    ],
    detectedObjects: ['Protective Shields', 'Crowd Barriers', 'Dense Gathering'],
    threatIndicators: ['Postural Tension', 'Perimeter Compression'],
    isDemo: true
  }
];

export const INITIAL_DEMO_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    analysisId: 'demo-misinfo-1',
    module: 'misinformation',
    title: 'Severe Viral Conspiracy Claim: Pathogen RF Dissemination',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    riskLevel: 'Critical',
    riskScore: 94,
    confidenceScore: 96,
    category: 'Likely Misinformation',
    snippet: 'Leaked research claims 5G towers transmit synthetic pathogens into urban populations...',
    status: 'Active'
  },
  {
    id: 'alert-2',
    analysisId: 'demo-violence-1',
    module: 'violence',
    title: 'Active Physical Altercation & Assault Vectors Detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    riskLevel: 'High',
    riskScore: 88,
    confidenceScore: 91,
    category: 'Fighting / Assault',
    snippet: 'Transit concourse video: Kinematic velocity strike patterns and ground tackling detected.',
    status: 'Investigating',
    assignedTo: 'Officer M. Vance'
  },
  {
    id: 'alert-3',
    analysisId: 'demo-violence-2',
    module: 'violence',
    title: 'Perimeter Tension & Elevated Aggression Dynamics',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    riskLevel: 'Moderate',
    riskScore: 62,
    confidenceScore: 84,
    category: 'Aggressive Activity',
    snippet: 'Civic center protest: Postural tension and barrier compression flagged.',
    status: 'Resolved',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    resolutionNotes: 'Human operator confirmed crowd dispersed peacefully without kinetic escalation.'
  }
];

export const SAMPLE_MISINFORMATION_PROMPTS = [
  {
    title: 'Viral Health Misinformation',
    category: 'Health / Medicine',
    text: 'URGENT HEALTH ALERT: Drinking concentrated boiled silver water with citrus peel completely cures all respiratory viral infections within 4 hours. Pharmaceutical companies are bribing doctors to censor this natural protocol because it would destroy their trillion dollar vaccine monopoly!'
  },
  {
    title: 'Financial & Banking Panic Rumor',
    category: 'Finance / Economy',
    text: 'INSIDER WARNING: The Federal Reserve is shutting down all ATM networks starting midnight tomorrow to confiscate private savings accounts and force everyone onto a centralized social credit digital token. Withdraw all your cash immediately before banks freeze your funds forever!'
  },
  {
    title: 'Verified Scientific Press Release',
    category: 'Science / Astronomy',
    text: 'Researchers at the European Southern Observatory have discovered a rocky exoplanet orbiting within the circumstellar habitable zone of Proxima Centauri. Radial velocity data indicates a minimum mass 1.17 times that of Earth with equilibrium temperature supporting potential liquid water.'
  },
  {
    title: 'Geopolitical Social Media Speculation',
    category: 'Geopolitics',
    text: 'BREAKING: Satellite images show massive military convoys crossing international borders without declaration. Reliable local sources report power grid blackout across three major capital cities and immediate airspace closure.'
  }
];

export const SAMPLE_VIOLENCE_TESTS = [
  {
    id: 'vtest-video-1',
    title: 'Surveillance Video: Public Altercation & Brawl Sequence',
    type: 'video' as const,
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    description: 'Surveillance video: Rapid kinetic strikes, ground tackling, and bystander crowd dispersal.'
  },
  {
    id: 'vtest-video-2',
    title: 'Sports Video: Taekwondo & Sparring (Regulated Combat)',
    type: 'video' as const,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    description: 'Controlled athletic combat sport with protective headgear, pads, and referee supervision.'
  },
  {
    id: 'vtest-video-3',
    title: 'Baseline Video: Peaceful Pedestrian Concourse',
    type: 'video' as const,
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    description: 'Calm pedestrian movement, standard spatial spacing, no kinetic confrontation.'
  },
  {
    id: 'vtest-image-1',
    title: 'Martial Arts Sparring (Image)',
    type: 'image' as const,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    description: 'Two athletes sparring inside a designated ring with protective gloves.'
  },
  {
    id: 'vtest-image-2',
    title: 'Public Confrontation & Hostile Gestures (Image)',
    type: 'image' as const,
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    description: 'Civic crowd with heated non-verbal posturing and security barrier compression.'
  },
  {
    id: 'vtest-image-3',
    title: 'Peaceful Community Gathering (Image)',
    type: 'image' as const,
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    description: 'Civilians conversing peacefully in an outdoor sunny park environment.'
  }
];
