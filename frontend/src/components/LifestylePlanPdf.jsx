import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 0, 
    fontSize: 10, 
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 0, 
    textAlign: 'center',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  headerContainer: {
    backgroundColor: '#b0004e',
    padding: 30,
    marginBottom: 25,
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center'
  },
  contentContainer: {
    padding: 30,
    paddingTop: 0
  },
  section: { 
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b0004e',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '2px solid #f3e8ff',
    paddingBottom: 8
  },
  bold: { 
    fontWeight: 'bold',
    color: '#b0004e'
  },
  checklist: { 
    marginTop: 25,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #e5e7eb'
  },
  checklistItem: { 
    flexDirection: 'row', 
    marginBottom: 10,
    alignItems: 'flex-start',
    paddingVertical: 4
  },
  checkbox: { 
    marginRight: 12,
    fontSize: 14,
    color: '#6a0dad',
    fontWeight: 'bold'
  },
  factorBlock: { 
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #f3f4f6'
  },
  checklistTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15,
    color: '#b0004e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '2px solid #f3e8ff',
    paddingBottom: 8
  },
  riskSummary: {
    backgroundColor: '#fef3f2',
    padding: 16,
    borderRadius: 10,
    borderLeft: 5,
    borderLeftColor: '#b0004e',
    marginBottom: 20,
    border: '1px solid #fecaca'
  },
  riskSummaryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b0004e',
    textAlign: 'center'
  },
  improvementText: {
    color: '#059669'
  },
  declineText: {
    color: '#dc2626'
  },
  neutralText: {
    color: '#6b7280'
  },
  factorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4
  },
  factorDescription: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.4
  },
  footer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 1.3
  }
});

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const generateMessageParts = (type, name, current, simulated) => {
  const starts = {
    improvement: [
      `Great improvement in your ${name.toLowerCase()} — moving from `,
      `You've enhanced your ${name.toLowerCase()} by changing from `,
      `Excellent progress with your ${name.toLowerCase()} — going from `
    ],
    decline: [
      `Your ${name.toLowerCase()} changed from `,
      `You adjusted your ${name.toLowerCase()} from `,
      `Your ${name.toLowerCase()} shifted from `
    ],
    neutral: [
      `You maintained your current ${name.toLowerCase()} at `,
      `Your ${name.toLowerCase()} stays at `,
      `You kept your ${name.toLowerCase()} consistent at `
    ]
  };

  const intro = pickRandom(starts[type]);
  const commonEnd = type === "improvement"
    ? ". This is a positive step for your health."
    : type === "decline"
    ? ". Consider adjusting this if possible."
    : ". Consistency is good for your routine.";

  if (type === "neutral" || current === simulated) {
    return [intro, { bold: true, text: simulated }, commonEnd];
  } else {
    return [intro, { bold: true, text: current }, " to ", { bold: true, text: simulated }, commonEnd];
  }
};

const generateChecklistItem = (name, value, isImprovement = true) => {
  const map = {
    "Fruits/Veg": `Eat ${value} of fruits and vegetables daily.`,
    "Exercise": `Exercise ${value} per week.`,
    "Sleep": `Maintain ${value} sleep quality.`,
    "Stress": `Keep stress levels at ${value}.`,
    "Smoking": `${value} smoking habit.`,
    "Alcohol": `Limit alcohol intake to ${value}.`,
    "Processed Meat": `Consume processed meat ${value}.`,
    "Sun Protection": `Practice ${value} sun protection.`,
    "BMI": `Maintain BMI at ${value}.`
  };
  
  const baseText = map[name] || `${name}: ${value}`;
  
  if (isImprovement) {
    return baseText;
  } else {
    return `${baseText} (not recommended)`;
  }
};

const findClosestOption = (factor, value) => {
  if (!factor.options || factor.options.length === 0) return { text: "N/A", points: 0 };
  return factor.options.reduce((prev, curr) =>
    Math.abs(curr.points - value) < Math.abs(prev.points - value) ? curr : prev
  );
};

const LifestylePlanPdf = ({ currentRiskScore, simulatedRiskScore, modifiableFactors }) => {
  const riskReduction = currentRiskScore - simulatedRiskScore;
  let tone = riskReduction < 0
    ? simulatedRiskScore <= 25
      ? "risk_increase_low"
      : "risk_increase"
    : simulatedRiskScore <= 25
    ? "celebratory_low"
    : simulatedRiskScore <= 50
    ? "balanced_moderate"
    : riskReduction >= 15
    ? "motivated_improver"
    : "caution_high";
  const headerTextMap = {
    risk_increase_low: `Your estimated cancer risk has increased to ${simulatedRiskScore}%, but you're still in the low-risk category. While this is manageable, consider making healthier choices to maintain your low-risk status.`,
    risk_increase: `Your estimated cancer risk has increased to ${simulatedRiskScore}%. This lifestyle plan may not be optimal for your health. Consider adjusting your choices to reduce your risk instead.`,
    celebratory_low: `Amazing work! Your lifestyle choices have brought your estimated cancer risk to just ${simulatedRiskScore}%. This personalized plan celebrates your progress and helps you continue on a healthy path.`,
    balanced_moderate: `You're on the right track! Your estimated risk is now ${simulatedRiskScore}%. This plan supports your next steps to reduce it even further.`,
    motivated_improver: `Great progress! You've reduced your risk by ${riskReduction}%. Even though there's more to work on, this plan recognizes your commitment and guides you further.`,
    caution_high: `Your estimated risk is ${simulatedRiskScore}%. This plan outlines meaningful changes you can make to lower that number and take charge of your health.`
  };

  // Filter to only include factors that were changed
  const changedFactors = modifiableFactors.filter(factor => {
    const current = findClosestOption(factor, factor.currentValue);
    const simulated = findClosestOption(factor, factor.simulatedValue);
    return simulated.points !== current.points;
  });

  // Sort factors: improvements first, then declines
  const sortedFactors = changedFactors.sort((a, b) => {
    const aCurrent = findClosestOption(a, a.currentValue);
    const aSimulated = findClosestOption(a, a.simulatedValue);
    const bCurrent = findClosestOption(b, b.currentValue);
    const bSimulated = findClosestOption(b, b.simulatedValue);
    
    const aIsImprovement = aSimulated.points < aCurrent.points;
    const bIsImprovement = bSimulated.points < bCurrent.points;
    
    if (aIsImprovement && !bIsImprovement) return -1;
    if (!aIsImprovement && bIsImprovement) return 1;
    return 0;
  });

  // Separate improvements and declines
  const improvements = sortedFactors.filter(factor => {
    const current = findClosestOption(factor, factor.currentValue);
    const simulated = findClosestOption(factor, factor.simulatedValue);
    return simulated.points < current.points;
  });

  const declines = sortedFactors.filter(factor => {
    const current = findClosestOption(factor, factor.currentValue);
    const simulated = findClosestOption(factor, factor.simulatedValue);
    return simulated.points > current.points;
  });

  // Calculate total risk change from changed factors
  const totalRiskChange = changedFactors.reduce((total, factor) => {
    const current = findClosestOption(factor, factor.currentValue);
    const simulated = findClosestOption(factor, factor.simulatedValue);
    return total + (current.points - simulated.points);
  }, 0);

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Your Personalized Lifestyle Plan</Text>
          <Text style={styles.headerSubtitle}>Risk Score: {simulatedRiskScore}%</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text>{headerTextMap[tone]}</Text>
          </View>
          
          {/* Risk Change Summary */}
          {changedFactors.length > 0 && (
            <View style={styles.riskSummary}>
              <Text style={styles.riskSummaryText}>
                {riskReduction > 0 
                  ? `Risk Reduction: ${riskReduction}%`
                  : `Risk Increase: ${Math.abs(riskReduction)}%`
                }
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle Changes</Text>
            
            {/* Improvements */}
            {improvements.length > 0 && (
              <>
                <Text style={[styles.bold, styles.improvementText, { marginBottom: 10, fontSize: 12 }]}>
                  ✅ IMPROVEMENTS
                </Text>
                {improvements.map((factor, idx) => {
                  const current = findClosestOption(factor, factor.currentValue);
                  const simulated = findClosestOption(factor, factor.simulatedValue);
                  const messageParts = generateMessageParts("improvement", factor.name, current.text, simulated.text);
                  
                  return (
                    <View key={factor.name + idx} style={styles.factorBlock}>
                      <Text style={styles.factorName}>{factor.name}</Text>
                      <Text style={styles.improvementText}>
                        {messageParts.map((part, i) =>
                          typeof part === 'string' ? part : <Text key={i} style={[styles.bold, styles.improvementText]}>{part.text}</Text>
                        )}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}

            {/* Declines */}
            {declines.length > 0 && (
              <>
                <Text style={[styles.bold, styles.declineText, { marginBottom: 10, fontSize: 12, marginTop: improvements.length > 0 ? 15 : 0 }]}>
                  ⚠️ DECLINES
                </Text>
                {declines.map((factor, idx) => {
                  const current = findClosestOption(factor, factor.currentValue);
                  const simulated = findClosestOption(factor, factor.simulatedValue);
                  const messageParts = generateMessageParts("decline", factor.name, current.text, simulated.text);
                  
                  return (
                    <View key={factor.name + idx} style={styles.factorBlock}>
                      <Text style={styles.factorName}>{factor.name}</Text>
                      <Text style={styles.declineText}>
                        {messageParts.map((part, i) =>
                          typeof part === 'string' ? part : <Text key={i} style={[styles.bold, styles.declineText]}>{part.text}</Text>
                        )}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
          
          <View style={styles.checklist}>
            <Text style={styles.checklistTitle}>Your Action Checklist</Text>
            
            {/* Improvements in checklist */}
            {improvements.map((factor, idx) => {
              const simulated = findClosestOption(factor, factor.simulatedValue);
              const checklistText = generateChecklistItem(factor.name, simulated.text, true);
              
              return (
                <View key={factor.name + '_check_' + idx} style={styles.checklistItem}>
                  <Text style={styles.checkbox}>[ ]</Text>
                  <Text style={styles.improvementText}>{checklistText}</Text>
                </View>
              );
            })}

            {/* Declines in checklist */}
            {declines.map((factor, idx) => {
              const simulated = findClosestOption(factor, factor.simulatedValue);
              const checklistText = generateChecklistItem(factor.name, simulated.text, false);
              
              return (
                <View key={factor.name + '_check_' + idx} style={styles.checklistItem}>
                  <Text style={[styles.checkbox, styles.declineText]}>[!]</Text>
                  <Text style={styles.declineText}>{checklistText}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This personalized plan is based on your current lifestyle factors and simulated changes. 
              Always consult with healthcare professionals before making significant lifestyle changes.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default LifestylePlanPdf; 