const scs_articles = require("../data/scs_articles");

function getBestMatch(query, userProfile = null) {
  const lowered = query.toLowerCase().replace(/[^\w\s]/g, "");
  const queryWords = lowered.split(" ");

  const scoredTopics = [];

  for (const [topic, fact] of Object.entries(scs_articles)) {
    const topicWords = topic.toLowerCase().split(" ");
    const factWords = fact.toLowerCase().split(/\W+/);

    // Match overlap in topic title and fact body
    const matchInTitle = topicWords.filter(word => queryWords.includes(word)).length;
    const matchInBody = factWords.filter(word => queryWords.includes(word)).length;

    let totalScore = matchInTitle * 2 + matchInBody * 0.5; // weighted scoring

    // Add personalization scoring if user profile exists
    if (userProfile && userProfile.riskFactors) {
      // Boost relevance for user's risk factors
      const riskFactorMatches = userProfile.riskFactors.filter(factor => 
        fact.toLowerCase().includes(factor.toLowerCase().replace(' ', ''))
      ).length;
      
      if (riskFactorMatches > 0) {
        totalScore *= 1.5; // 50% boost for relevant risk factors
      }

      // Boost screening recommendations for high-risk users
      if (userProfile.riskLevel === 'HIGH_RISK' && 
          (fact.toLowerCase().includes('screening') || fact.toLowerCase().includes('test'))) {
        totalScore *= 2.0; // Double score for screening topics
      }

      // Boost prevention topics for moderate risk users
      if (userProfile.riskLevel === 'MODERATE_RISK' && 
          fact.toLowerCase().includes('prevent')) {
        totalScore *= 1.3;
      }
    }

    if (totalScore > 0) {
      scoredTopics.push({ topic, fact, score: totalScore });
    }
  }

  // Sort by descending score
  scoredTopics.sort((a, b) => b.score - a.score);

  if (scoredTopics.length === 0 || scoredTopics[0].score < 1) {
    return {
      topics: ["Out of Scope"],
      facts: [],
      confidence: 0
    };
  }

  // Select top 1–3 matches with similar scores
  const topScore = scoredTopics[0].score;
  const selected = scoredTopics.filter(t => t.score >= topScore - 1).slice(0, 3);

  const combinedFacts = selected.map(t => t.fact).join("\n\n");
  const combinedTopics = selected.map(t => t.topic);
  const averageConfidence = selected.reduce((sum, t) => sum + t.score, 0) / (5 * selected.length);

  return {
    topics: combinedTopics,
    facts: [combinedFacts],
    confidence: Number(averageConfidence.toFixed(4))
  };
}

module.exports = getBestMatch;



