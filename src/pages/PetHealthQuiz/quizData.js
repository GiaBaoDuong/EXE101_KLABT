/**
 * Pet Health Quiz — Mock Data
 *
 * Data format designed for future backend API integration.
 * Each quiz category has questions, result rules, and recommended product tags.
 */

export const QUIZ_CATEGORIES = [
  {
    id: 'behavior-mental',
    title: 'Mental & Behavioral Health',
    description: 'Assess stress, anxiety, and abnormal behavioral changes in your pet.',
    icon: 'brain',
    recommendedProductTags: ['calming', 'toy', 'comfort', 'stress-relief'],
    questions: [
      {
        id: 'bm-q1',
        questionText: 'Does your pet frequently hide or show fear around strangers?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q2',
        questionText: 'Does your pet bark, growl, or make unusual sounds persistently?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q3',
        questionText: 'Does your pet excessively lick one spot, bite its paws, or spin in circles?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q4',
        questionText: 'Does your pet seem less active, rest in one place, or avoid playtime?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q5',
        questionText: 'Does your pet destroy objects, have accidents indoors, or show destructive behavior?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q6',
        questionText: 'Has your pet\'s sleep routine changed — sleeping more or tossing and turning?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q7',
        questionText: 'Has your pet become more aggressive or withdrawn than usual?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q8',
        questionText: 'Does your pet show unusual fear of loud noises, thunder, or fireworks?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q9',
        questionText: 'Does your pet frequently shake its head, scratch its ears, or seem uncomfortable around the head/face?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'bm-q10',
        questionText: 'Has your pet shown sudden behavioral changes for no clear reason?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
    ],
    resultRules: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'Normal',
        severity: 'low',
        summary: 'Your pet shows no obvious signs of behavioral abnormality.',
        advice: 'Continue maintaining a healthy routine, play schedule, and regular observation.',
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Monitor',
        severity: 'medium',
        summary: 'Your pet shows some signs that warrant further observation.',
        advice: 'Monitor over the next few days; note any changes in eating, sleeping, and behavior.',
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'At Risk',
        severity: 'high',
        summary: 'Your pet shows multiple signs of behavioral and psychological abnormalities.',
        advice: 'Consult a veterinarian if the condition persists or worsens.',
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'See a Vet',
        severity: 'critical',
        summary: 'The score indicates a high risk — your pet needs professional evaluation.',
        advice: 'Take your pet to a veterinarian as soon as possible for an accurate assessment.',
      },
    ],
  },
  {
    id: 'digestion',
    title: 'Digestion & Eating',
    description: 'Check for loss of appetite, vomiting, diarrhea, constipation, and appetite changes.',
    icon: 'stomach',
    recommendedProductTags: ['probiotic', 'digestive', 'food', 'supplement'],
    questions: [
      {
        id: 'dg-q1',
        questionText: 'Is your pet refusing food, skipping meals, or eating less than usual?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q2',
        questionText: 'Does your pet vomit or seem nauseous after eating?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q3',
        questionText: 'Does your pet have loose stools, diarrhea, or bloody stool?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q4',
        questionText: 'Is your pet constipated, straining when defecating, or going less often?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q5',
        questionText: 'Does your pet\'s belly appear swollen, distended, or seem painful?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q6',
        questionText: 'Has your pet\'s appetite changed — eating unusual foods or non-food items (pica)?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q7',
        questionText: 'Has your pet experienced sudden weight gain or unexplained weight loss?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q8',
        questionText: 'Does your pet have unusually or severely bad breath?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q9',
        questionText: 'Does your pet scoot or seem uncomfortable around the anal area?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'dg-q10',
        questionText: 'Is your pet drinking significantly more or less water than usual?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
    ],
    resultRules: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'Normal',
        severity: 'low',
        summary: 'Your pet\'s digestive system is functioning well with no signs of abnormality.',
        advice: 'Maintain a balanced diet and regular monitoring.',
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Monitor',
        severity: 'medium',
        summary: 'Some digestive signs warrant further observation.',
        advice: 'Pay attention to diet, eliminate irritating foods, and record symptoms.',
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'At Risk',
        severity: 'high',
        summary: 'Your pet shows multiple concerning digestive issues.',
        advice: 'See a veterinarian if symptoms persist for more than 48 hours.',
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'See a Vet',
        severity: 'critical',
        summary: 'Serious symptoms suggest a digestive issue that may require medical intervention.',
        advice: 'Take your pet to a veterinarian immediately for prompt examination and treatment.',
      },
    ],
  },
  {
    id: 'skin-coat',
    title: 'Skin, Coat & Allergies',
    description: 'Check for hair loss, itching, redness, dandruff, dermatitis, and allergies.',
    icon: 'paw',
    recommendedProductTags: ['skin-care', 'shampoo', 'supplement', 'allergy'],
    questions: [
      {
        id: 'sc-q1',
        questionText: 'Is your pet experiencing unusual hair loss or visibly thinning fur?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q2',
        questionText: 'Does your pet scratch, bite, or lick one area of the body repeatedly?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q3',
        questionText: 'Are there red spots, rashes, pimples, or scabs on your pet\'s skin?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q4',
        questionText: 'Does your pet\'s fur look matted, dry, frizzy, or have dandruff?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q5',
        questionText: 'Does your pet have seasonal allergies or react after eating new food?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q6',
        questionText: 'Does your pet shake its head or scratch its ears with unusual discharge?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q7',
        questionText: 'Are there bald patches, scars, or thickened skin on your pet?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q8',
        questionText: 'Does your pet have an unusual bad odor from the skin or ears?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q9',
        questionText: 'Does your pet frequently lick its paws, elbows, or armpits?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'sc-q10',
        questionText: 'Has the fur color changed around the eyes, mouth, or paws?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
    ],
    resultRules: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'Normal',
        severity: 'low',
        summary: 'Your pet\'s skin and coat are healthy with no signs of allergy or inflammation.',
        advice: 'Keep up regular grooming and maintain a proper diet.',
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Monitor',
        severity: 'medium',
        summary: 'Some skin and coat signs need further observation.',
        advice: 'Check abnormal skin areas, adjust diet, and record symptoms.',
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'At Risk',
        severity: 'high',
        summary: 'Your pet shows multiple skin, coat, and possible allergy symptoms.',
        advice: 'Visit a veterinarian for allergy testing and treatment.',
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'See a Vet',
        severity: 'critical',
        summary: 'Serious skin condition, possibly related to dermatitis or parasites.',
        advice: 'Take your pet to a veterinarian immediately for diagnosis and treatment.',
      },
    ],
  },
  {
    id: 'mobility',
    title: 'Mobility & Joint Health',
    description: 'Check for difficulty walking, limping, reduced activity, and joint pain.',
    icon: 'bone',
    recommendedProductTags: ['joint', 'mobility', 'supplement', 'pain-relief'],
    questions: [
      {
        id: 'mb-q1',
        questionText: 'Does your pet struggle to stand up after lying down or seem stiff when moving?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q2',
        questionText: 'Does your pet limp, favor one leg, or walk abnormally?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q3',
        questionText: 'Does your pet show less activity, avoid running, jumping, or walking as usual?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q4',
        questionText: 'Does your pet tire unusually quickly after mild exercise or play?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q5',
        questionText: 'Does your pet lick, bite, or gnaw at its joints or legs?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q6',
        questionText: 'Is there any swelling or heat in the joint or leg area?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q7',
        questionText: 'Does your pet show signs of pain when its back, hips, or legs are touched?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q8',
        questionText: 'Has your pet changed its sitting, standing, or defecating posture?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q9',
        questionText: 'Does your pet lie in awkward positions or avoid walking on slippery surfaces?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 'mb-q10',
        questionText: 'Does your pet seem quieter, less interactive, and less engaged with you?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
    ],
    resultRules: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'Normal',
        severity: 'low',
        summary: 'Your pet is moving well with no signs of joint issues.',
        advice: 'Keep up regular exercise appropriate for age and weight.',
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Monitor',
        severity: 'medium',
        summary: 'Some mobility signs need monitoring.',
        advice: 'Limit strenuous activity, consider glucosamine supplements, and track symptoms.',
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'At Risk',
        severity: 'high',
        summary: 'Your pet shows multiple signs of mobility and joint abnormalities.',
        advice: 'Visit a veterinarian for X-ray imaging and treatment consultation.',
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'See a Vet',
        severity: 'critical',
        summary: 'The signs suggest your pet may have a serious joint condition.',
        advice: 'Take your pet to a veterinarian immediately for imaging and treatment.',
      },
    ],
  },
  {
    id: 'respiratory-energy',
    title: 'Respiratory & Energy',
    description: 'Check for coughing, rapid breathing, fatigue, excessive sleep, and reduced stamina.',
    icon: 'lungs',
    recommendedProductTags: ['respiratory', 'vitamin', 'energy', 'immunity'],
    questions: [
      {
        id: 're-q1',
        questionText: 'Does your pet frequently cough, hack, or sneeze persistently?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q2',
        questionText: 'Does your pet breathe rapidly, pant heavily, or struggle to breathe even at rest?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q3',
        questionText: 'Is your pet unusually tired, lethargic, or lacking its usual energy?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q4',
        questionText: 'Does your pet sleep more than usual, even during the day?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q5',
        questionText: 'Does your pet play less and interact less with you or other pets?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q6',
        questionText: 'Does your pet have reduced stamina — getting tired after short walks?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q7',
        questionText: 'Does your pet have a runny nose, red eyes, or unusual discharge from nose/eyes?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q8',
        questionText: 'Does your pet have a fever (hot ears, dry nose) or abnormal body temperature?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q9',
        questionText: 'Does your pet snore or make unusual breathing sounds while sleeping?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
      {
        id: 're-q10',
        questionText: 'Is your pet\'s tongue or gums pale or blue instead of healthy pink?',
        options: [
          { label: 'Never', score: 0 },
          { label: 'Sometimes', score: 1 },
          { label: 'Often', score: 2 },
          { label: 'Very Often', score: 3 },
        ],
      },
    ],
    resultRules: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'Normal',
        severity: 'low',
        summary: 'Your pet has good stamina and breathing, with no signs of abnormality.',
        advice: 'Maintain moderate exercise and a nutritious diet.',
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Monitor',
        severity: 'medium',
        summary: 'Some respiratory and energy signs need further observation.',
        advice: 'Track breathing rate, sleep patterns, and activity levels over 5-7 days.',
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'At Risk',
        severity: 'high',
        summary: 'Your pet shows multiple signs of respiratory and stamina issues.',
        advice: 'Visit a veterinarian for a respiratory check and blood tests.',
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'See a Vet',
        severity: 'critical',
        summary: 'Serious respiratory signs — possibly related to heart or lung disease.',
        advice: 'This requires immediate attention. Take your pet to a veterinarian as soon as possible.',
      },
    ],
  },
]

/** Mock recommended products (in a real app, this would come from the backend) */
export const MOCK_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Calming Treats Premium',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=80',
    price: 180000,
    category: 'calming',
    reason: 'Helps reduce stress and anxiety in pets.',
  },
  {
    id: 'prod-002',
    name: 'Interactive Puzzle Toy',
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=300&q=80',
    price: 250000,
    category: 'toy',
    reason: 'Stimulates the mind, reduces boredom and destructive behavior.',
  },
  {
    id: 'prod-003',
    name: 'Pet Comfort Bed',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&q=80',
    price: 420000,
    category: 'comfort',
    reason: 'Cozy bed that helps pets rest more comfortably.',
  },
  {
    id: 'prod-004',
    name: 'Probiotic Powder',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&q=80',
    price: 195000,
    category: 'probiotic',
    reason: 'Improves gut bacteria balance and supports digestion.',
  },
  {
    id: 'prod-005',
    name: 'Digestive Enzyme Supplement',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80',
    price: 220000,
    category: 'digestive',
    reason: 'Helps break down food, reduces bloating and indigestion.',
  },
  {
    id: 'prod-006',
    name: 'Sensitive Skin Shampoo',
    image: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=300&q=80',
    price: 135000,
    category: 'skin-care',
    reason: 'Gentle on sensitive skin, reduces itching and irritation.',
  },
  {
    id: 'prod-007',
    name: 'Omega-3 Coat Supplement',
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300&q=80',
    price: 280000,
    category: 'supplement',
    reason: 'Promotes a shiny, healthy coat and reduces shedding and dandruff.',
  },
  {
    id: 'prod-008',
    name: 'Joint Support Chews',
    image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=300&q=80',
    price: 310000,
    category: 'joint',
    reason: 'Glucosamine & chondroitin support strong, healthy cartilage.',
  },
  {
    id: 'prod-009',
    name: 'Mobility Plus Liquid',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&q=80',
    price: 350000,
    category: 'mobility',
    reason: 'Reduces joint pain and enhances mobility in pets.',
  },
  {
    id: 'prod-010',
    name: 'Respiratory Vitality Syrup',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&q=80',
    price: 240000,
    category: 'respiratory',
    reason: 'Supports healthy respiration, reduces coughing and rapid breathing.',
  },
  {
    id: 'prod-011',
    name: 'Multivitamin Plus',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=80',
    price: 195000,
    category: 'vitamin',
    reason: 'Comprehensive vitamin supplement to boost immunity.',
  },
  {
    id: 'prod-012',
    name: 'Immunity Booster Drops',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&q=80',
    price: 265000,
    category: 'immunity',
    reason: 'Strengthens the immune system and reduces fatigue.',
  },
  {
    id: 'prod-013',
    name: 'Anti-Allergy Liquid',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&q=80',
    price: 230000,
    category: 'allergy',
    reason: 'Reduces skin and respiratory allergic reactions.',
  },
  {
    id: 'prod-014',
    name: 'Grooming Kit Pro',
    image: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=300&q=80',
    price: 380000,
    category: 'shampoo',
    reason: 'Professional grooming kit for healthy skin and coat.',
  },
  {
    id: 'prod-015',
    name: 'Calming Spray',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80',
    price: 145000,
    category: 'stress-relief',
    reason: 'Lavender spray helps pets relax during stressful situations.',
  },
]

/** Calculate quiz result based on answers */
export function calculateQuizResult(answers, resultRules) {
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0)
  const maxScore = answers.length * 3
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  const matchedRule = resultRules.find(
    rule => scorePercent >= rule.minPercent && scorePercent <= rule.maxPercent
  ) || resultRules[resultRules.length - 1]

  return {
    totalScore,
    maxScore,
    scorePercent,
    ...matchedRule,
  }
}

/** Get recommended products by tags */
export function getRecommendedProductsByTags(tags, allProducts) {
  if (!tags || tags.length === 0) return []
  return allProducts.filter(product => tags.includes(product.category)).slice(0, 4)
}

/** Build payload for backend submission */
export function buildQuizSubmissionPayload({
  userId,
  petId,
  quizCategory,
  answers,
  result,
  recommendedProducts,
}) {
  return {
    userId: userId || 'mock-user-id',
    petId: petId || 'mock-pet-id',
    quizCategoryId: quizCategory.id,
    quizCategoryTitle: quizCategory.title,
    answers: answers.map(a => ({
      questionId: a.questionId,
      questionText: a.questionText,
      selectedOptionLabel: a.selectedOptionLabel,
      score: a.score,
    })),
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    scorePercent: result.scorePercent,
    result: {
      level: result.level,
      severity: result.severity,
      summary: result.summary,
      advice: result.advice,
    },
    recommendedProductTags: quizCategory.recommendedProductTags,
    recommendedProducts: recommendedProducts.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image,
      price: p.price,
      category: p.category,
      reason: p.reason,
    })),
    createdAt: new Date().toISOString(),
  }
}
