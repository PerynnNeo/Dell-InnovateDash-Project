const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
require('dotenv').config();

const cancerIQQuiz = {
  _id: "knowledge_quiz-v1",
  title: "Test Your Knowledge About Cancer",
  version: 1,
  questions: [
    {
      id: "q1",
      text: "Which lifestyle factor contributes MOST to cancer risk?",
      options: [
        { id: "a", text: "Smoking", isCorrect: true, weight: 10 },
        { id: "b", text: "Poor diet", isCorrect: false, weight: 0 },
        { id: "c", text: "Lack of exercise", isCorrect: false, weight: 0 },
        { id: "d", text: "Stress", isCorrect: false, weight: 0 }
      ],
      explanation: "Tobacco accounts for roughly 30% of all cancer deaths. Smoking is the leading preventable cause of cancer worldwide."
    },
    {
      id: "q2",
      text: "What percentage of cancers can be prevented through lifestyle changes?",
      options: [
        { id: "a", text: "10-20%", isCorrect: false, weight: 0 },
        { id: "b", text: "30-50%", isCorrect: true, weight: 10 },
        { id: "c", text: "60-70%", isCorrect: false, weight: 0 },
        { id: "d", text: "80-90%", isCorrect: false, weight: 0 }
      ],
      explanation: "Research shows that 30-50% of cancers can be prevented through healthy lifestyle choices including diet, exercise, and avoiding tobacco."
    },
    {
      id: "q3",
      text: "Which food group is MOST protective against cancer?",
      options: [
        { id: "a", text: "Red meat", isCorrect: false, weight: 0 },
        { id: "b", text: "Processed foods", isCorrect: false, weight: 0 },
        { id: "c", text: "Fruits and vegetables", isCorrect: true, weight: 10 },
        { id: "d", text: "Dairy products", isCorrect: false, weight: 0 }
      ],
      explanation: "Fruits and vegetables contain antioxidants, vitamins, and phytochemicals that help protect cells from damage that can lead to cancer."
    },
    {
      id: "q4",
      text: "At what age should most people start regular cancer screening?",
      options: [
        { id: "a", text: "30", isCorrect: false, weight: 0 },
        { id: "b", text: "40", isCorrect: false, weight: 0 },
        { id: "c", text: "50", isCorrect: true, weight: 10 },
        { id: "d", text: "60", isCorrect: false, weight: 0 }
      ],
      explanation: "Most cancer screening guidelines recommend starting at age 50 for average-risk individuals, though some screenings like cervical cancer start earlier."
    },
    {
      id: "q5",
      text: "Which statement about sun exposure and cancer is TRUE?",
      options: [
        { id: "a", text: "Only fair-skinned people get skin cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "Tanning beds are safer than sun exposure", isCorrect: false, weight: 0 },
        { id: "c", text: "UV rays can cause skin cancer even on cloudy days", isCorrect: true, weight: 10 },
        { id: "d", text: "Sunscreen is only needed at the beach", isCorrect: false, weight: 0 }
      ],
      explanation: "UV rays can penetrate clouds and cause skin damage leading to cancer. Daily sun protection is important year-round."
    },
    {
      id: "q6",
      text: "What is the most common cancer worldwide?",
      options: [
        { id: "a", text: "Lung cancer", isCorrect: true, weight: 10 },
        { id: "b", text: "Breast cancer", isCorrect: false, weight: 0 },
        { id: "c", text: "Colorectal cancer", isCorrect: false, weight: 0 },
        { id: "d", text: "Prostate cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "Lung cancer is the most commonly diagnosed cancer globally, with smoking being the primary risk factor."
    },
    {
      id: "q7",
      text: "What is the main benefit of regular cancer screening?",
      options: [
        { id: "a", text: "It guarantees you won't get cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "It helps detect cancer early when it's easier to treat", isCorrect: true, weight: 10 },
        { id: "c", text: "It makes cancer disappear", isCorrect: false, weight: 0 },
        { id: "d", text: "It prevents all types of cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "Screening detects cancer early, often before symptoms appear, which improves chances of successful treatment."
    },{
      id: "q7",
      text: "Why is early cancer detection important?",
      options: [
        { id: "a", text: "It prevents all cancers", isCorrect: false, weight: 0 },
        { id: "b", text: "It increases the chance of successful treatment", isCorrect: true, weight: 10 },
        { id: "c", text: "It eliminates the need for any treatment", isCorrect: false, weight: 0 },
        { id: "d", text: "It helps gain immunity", isCorrect: false, weight: 0 }
      ],
      explanation: "Detecting cancer early often leads to better treatment outcomes and higher survival rates."
    },
    {
      id: "q8",
      text: "Which habit contributes MOST to lung cancer?",
      options: [
        { id: "a", text: "Drinking alcohol", isCorrect: false, weight: 0 },
        { id: "b", text: "Smoking tobacco", isCorrect: true, weight: 10 },
        { id: "c", text: "Consuming sugar", isCorrect: false, weight: 0 },
        { id: "d", text: "Lack of sleep", isCorrect: false, weight: 0 }
      ],
      explanation: "Smoking is the leading cause of lung cancer worldwide."
    },
    {
      id: "q9",
      text: "Which of these cancers is most linked to obesity?",
      options: [
        { id: "a", text: "Prostate cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "Colorectal cancer", isCorrect: true, weight: 10 },
        { id: "c", text: "Skin cancer", isCorrect: false, weight: 0 },
        { id: "d", text: "Throat cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "Obesity increases the risk of colorectal cancer, among others."
    },
    {
      id: "q10",
      text: "True or False: If you don’t have symptoms, you don’t need cancer screening.",
      options: [
        { id: "a", text: "True", isCorrect: false, weight: 0 },
        { id: "b", text: "False", isCorrect: true, weight: 10 }
      ],
      explanation: "Screening is for people without symptoms to detect cancer early before it shows signs."
    },
    {
      id: "q11",
      text: "What is the main screening test for colorectal cancer in Singapore?",
      options: [
        { id: "a", text: "Pap test", isCorrect: false, weight: 0 },
        { id: "b", text: "Faecal Immunochemical Test (FIT)", isCorrect: true, weight: 10 },
        { id: "c", text: "Urine test", isCorrect: false, weight: 0 },
        { id: "d", text: "Blood pressure test", isCorrect: false, weight: 0 }
      ],
      explanation: "FIT is a non-invasive test that checks for blood in stool — an early sign of colorectal cancer."
    },
    {
      id: "q12",
      text: "Which food type is considered a cancer risk if eaten frequently?",
      options: [
        { id: "a", text: "Whole grains", isCorrect: false, weight: 0 },
        { id: "b", text: "Fruits and vegetables", isCorrect: false, weight: 0 },
        { id: "c", text: "Processed meats", isCorrect: true, weight: 10 },
        { id: "d", text: "Legumes", isCorrect: false, weight: 0 }
      ],
      explanation: "Processed meats like bacon and sausages are linked to increased risk of colorectal cancer."
    },
    {
      id: "q13",
      text: "What is the most common cancer among men in Singapore?",
      options: [
        { id: "a", text: "Liver cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "Lung cancer", isCorrect: false, weight: 0 },
        { id: "c", text: "Prostate cancer", isCorrect: true, weight: 10 },
        { id: "d", text: "Throat cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "Prostate cancer is one of the most common cancers in Singaporean men."
    },
    {
      id: "q14",
      text: "Can alcohol consumption increase cancer risk?",
      options: [
        { id: "a", text: "No, alcohol only affects the liver", isCorrect: false, weight: 0 },
        { id: "b", text: "Yes, it is linked to multiple cancers", isCorrect: true, weight: 10 },
        { id: "c", text: "Only when mixed with tobacco", isCorrect: false, weight: 0 },
        { id: "d", text: "Only if consumed daily", isCorrect: false, weight: 0 }
      ],
      explanation: "Alcohol is a known risk factor for cancers such as liver, breast, throat, and colorectal cancer."
    },
    {
      id: "q15",
      text: "Which of the following is a recommended population-level cancer screening in Singapore?",
      options: [
        { id: "a", text: "Skin cancer screening", isCorrect: false, weight: 0 },
        { id: "b", text: "Genetic blood test", isCorrect: false, weight: 0 },
        { id: "c", text: "Colonoscopy for those over 50", isCorrect: true, weight: 10 },
        { id: "d", text: "MRI scans", isCorrect: false, weight: 0 }
      ],
      explanation: "Colonoscopy is recommended for those aged 50 and above to detect colorectal cancer early."
    },
    {
      id: "q16",
      text: "What is the recommended action if your FIT test is positive?",
      options: [
        { id: "a", text: "Ignore it if you feel fine", isCorrect: false, weight: 0 },
        { id: "b", text: "Repeat it in one year", isCorrect: false, weight: 0 },
        { id: "c", text: "Go for a follow-up colonoscopy", isCorrect: true, weight: 10 },
        { id: "d", text: "Change your diet", isCorrect: false, weight: 0 }
      ],
      explanation: "A positive FIT means further investigation like colonoscopy is needed to check for possible cancer."
    },
    {
      id: "q17",
      text: "Which organ does hepatocellular carcinoma affect?",
      options: [
        { id: "a", text: "Lung", isCorrect: false, weight: 0 },
        { id: "b", text: "Colon", isCorrect: false, weight: 0 },
        { id: "c", text: "Liver", isCorrect: true, weight: 10 },
        { id: "d", text: "Skin", isCorrect: false, weight: 0 }
      ],
      explanation: "Hepatocellular carcinoma is the most common type of primary liver cancer."
    },
    {
      id: "q18",
      text: "Which of these statements about cancer is TRUE?",
      options: [
        { id: "a", text: "Only older people get cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "Men can't get breast cancer", isCorrect: false, weight: 0 },
        { id: "c", text: "Anyone can get cancer, regardless of age or gender", isCorrect: true, weight: 10 },
        { id: "d", text: "Cancer is always genetic", isCorrect: false, weight: 0 }
      ],
      explanation: "Cancer can affect anyone, regardless of age, gender, or family history."
    },
    {
      id: "q19",
      text: "How can exercise help prevent cancer?",
      options: [
        { id: "a", text: "It replaces the need for screening", isCorrect: false, weight: 0 },
        { id: "b", text: "It boosts immunity and helps regulate weight", isCorrect: true, weight: 10 },
        { id: "c", text: "It removes cancer cells", isCorrect: false, weight: 0 },
        { id: "d", text: "It shortens treatment", isCorrect: false, weight: 0 }
      ],
      explanation: "Regular exercise helps reduce cancer risk by lowering inflammation, body fat, and improving immune response."
    },
    {
      id: "q20",
      text: "What is a common symptom of colorectal cancer?",
      options: [
        { id: "a", text: "Severe headaches", isCorrect: false, weight: 0 },
        { id: "b", text: "Blood in the stool", isCorrect: true, weight: 10 },
        { id: "c", text: "Dry skin", isCorrect: false, weight: 0 },
        { id: "d", text: "Toothache", isCorrect: false, weight: 0 }
      ],
      explanation: "Blood in stool, especially without pain, can be a warning sign of colorectal cancer."
    }, 
    {
      id: "q21",
      text: "Which group of women should go for HPV testing every 5 years?",
      options: [
        { id: "a", text: "Women under 25", isCorrect: false, weight: 0 },
        { id: "b", text: "Women aged 30 and above", isCorrect: true, weight: 10 },
        { id: "c", text: "All men", isCorrect: false, weight: 0 },
        { id: "d", text: "Women who already had cervical cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "In Singapore, HPV screening is recommended every 5 years for women aged 30 and above."
    },
    {
      id: "q22",
      text: "True or False: A person with no family history of cancer is not at risk.",
      options: [
        { id: "a", text: "True", isCorrect: false, weight: 0 },
        { id: "b", text: "False", isCorrect: true, weight: 10 }
      ],
      explanation: "Most cancers are caused by lifestyle, age, and environment — not just inherited genes."
    },
    {
      id: "q23",
      text: "Which cancer can sometimes be detected through a blood test called AFP?",
      options: [
        { id: "a", text: "Colorectal cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "Liver cancer", isCorrect: true, weight: 10 },
        { id: "c", text: "Lung cancer", isCorrect: false, weight: 0 },
        { id: "d", text: "Thyroid cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "AFP (Alpha-Fetoprotein) is sometimes used for liver cancer screening in high-risk individuals."
    },
    {
      id: "q24",
      text: "Which screening test is used to detect breast cancer early?",
      options: [
        { id: "a", text: "Pap smear", isCorrect: false, weight: 0 },
        { id: "b", text: "Mammogram", isCorrect: true, weight: 10 },
        { id: "c", text: "FIT test", isCorrect: false, weight: 0 },
        { id: "d", text: "Liver ultrasound", isCorrect: false, weight: 0 }
      ],
      explanation: "Mammograms are X-ray tests used to detect early signs of breast cancer in women."
    },
    {
      id: "q25",
      text: "Which lifestyle change has the GREATEST overall impact on lowering cancer risk?",
      options: [
        { id: "a", text: "Taking daily supplements", isCorrect: false, weight: 0 },
        { id: "b", text: "Quitting smoking", isCorrect: true, weight: 10 },
        { id: "c", text: "Washing hands often", isCorrect: false, weight: 0 },
        { id: "d", text: "Wearing sunglasses", isCorrect: false, weight: 0 }
      ],
      explanation: "Tobacco use is the single largest preventable cause of cancer worldwide."
    },
    {
      id: "q26",
      text: "What is the main cause of cervical cancer?",
      options: [
        { id: "a", text: "Lack of exercise", isCorrect: false, weight: 0 },
        { id: "b", text: "Human Papillomavirus (HPV) infection", isCorrect: true, weight: 10 },
        { id: "c", text: "Poor sleep", isCorrect: false, weight: 0 },
        { id: "d", text: "Overeating", isCorrect: false, weight: 0 }
      ],
      explanation: "Almost all cervical cancers are caused by long-term HPV infection."
    },
    {
      id: "q27",
      text: "Which of these symptoms may be an early warning sign of cancer?",
      options: [
        { id: "a", text: "A persistent lump", isCorrect: true, weight: 10 },
        { id: "b", text: "Occasional sneeze", isCorrect: false, weight: 0 },
        { id: "c", text: "Short naps", isCorrect: false, weight: 0 },
        { id: "d", text: "Sweating after exercise", isCorrect: false, weight: 0 }
      ],
      explanation: "A new or growing lump that does not go away should always be checked."
    },
    {
      id: "q28",
      text: "What is the main role of the Pap smear test?",
      options: [
        { id: "a", text: "To test for breast cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "To detect cervical cell changes", isCorrect: true, weight: 10 },
        { id: "c", text: "To diagnose liver problems", isCorrect: false, weight: 0 },
        { id: "d", text: "To test urine for cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "Pap smears are used to detect abnormal cells that may lead to cervical cancer."
    },
    {
      id: "q29",
      text: "True or False: Cancer screening should only be done once in a lifetime.",
      options: [
        { id: "a", text: "True", isCorrect: false, weight: 0 },
        { id: "b", text: "False", isCorrect: true, weight: 10 }
      ],
      explanation: "Regular screening based on age and risk is essential — one-time screening isn’t enough."
    },
    {
      id: "q30",
      text: "Which cancer is often detected late because it shows few early symptoms?",
      options: [
        { id: "a", text: "Colorectal cancer", isCorrect: false, weight: 0 },
        { id: "b", text: "Lung cancer", isCorrect: true, weight: 10 },
        { id: "c", text: "Skin cancer", isCorrect: false, weight: 0 },
        { id: "d", text: "Eye cancer", isCorrect: false, weight: 0 }
      ],
      explanation: "Lung cancer often shows no symptoms until advanced stages, which is why awareness and prevention are important."
    }
  ]
};

const seedQuiz = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing quiz
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    // Create new quiz
    const quiz = new Quiz(cancerIQQuiz);
    await quiz.save();
    console.log('Cancer IQ Quiz created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding quiz:', error);
    process.exit(1);
  }
};

seedQuiz();