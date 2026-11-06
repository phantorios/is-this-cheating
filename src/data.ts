// Quiz content extracted from the original site's source:
// https://ikura1.github.io/uwaki-hantei/ (repo: ikura1/uwaki-hantei)
// Original judgment sheet by Sukoya Kana (@sukosuko_sukoya), sheet design by
// Aria (@air_trpg). This file reproduces their content faithfully; the `jp`
// field below is the original wording, kept as the translation reference.

export type AnswerId = 'cheating' | 'uncomfortable' | 'ok'
export type FinalAnswer = 'yes' | 'no'
/** question id (1-40) -> chosen answer */
export type Answers = Record<number, AnswerId>

export interface Question {
  id: number
  text: string
  jp: string
}

export interface AnswerOption {
  id: AnswerId
  label: string
  points: number
}

export interface ResultTier {
  /** inclusive lower bound of the score band */
  min: number
  name: string
  jp: string
  description: string
}

export const MAX_SCORE = 80
export const QUESTIONS_PER_PAGE = 5
export const FINAL_QUESTION = 'If you were the one doing these things, would your answers change?'

export const ANSWER_OPTIONS: AnswerOption[] = [
  { id: 'cheating', label: 'Cheating', points: 2 },
  { id: 'uncomfortable', label: 'Not cheating, but uncomfortable', points: 1 },
  { id: 'ok', label: 'Completely OK', points: 0 },
]

export const QUESTIONS: Question[] = [
  { id: 1, text: 'Going out for lunch one-on-one with someone of the opposite sex', jp: '異性と二人でランチに行く' },
  { id: 2, text: 'Getting a meal alone with a close opposite-sex friend from your school days', jp: '学生時代からの異性の親友と二人でご飯' },
  { id: 3, text: 'Having drinks one-on-one with an opposite-sex coworker after work', jp: '仕事終わりに異性の同僚と二人で飲む' },
  { id: 4, text: 'Hanging out one-on-one with an opposite-sex friend your partner knows', jp: '恋人も知っている異性の友達と二人で遊ぶ' },
  { id: 5, text: 'Going to see a movie one-on-one with an opposite-sex friend', jp: '異性の友達と二人で映画を観に行く' },
  { id: 6, text: 'Giving a birthday present to an opposite-sex friend', jp: '異性の友達の誕生日にプレゼントを渡す' },
  { id: 7, text: 'Receiving a birthday present from an opposite-sex friend', jp: '異性の友達から誕生日プレゼントをもらう' },
  { id: 8, text: 'Messaging an opposite-sex friend every single day', jp: '異性の友達と毎日LINEする' },
  { id: 9, text: "Having late-night phone calls with an opposite-sex friend you've known for years", jp: '昔から仲の良い異性と深夜に電話する' },
  { id: 10, text: 'Asking an opposite-sex friend for advice about your love life', jp: '異性に恋愛相談する' },
  { id: 11, text: 'Being told "you\'re cute" or "you\'re cool" by someone of the opposite sex and happily accepting it', jp: '異性から「かわいい／かっこいい」と言われて普通に喜ぶ' },
  { id: 12, text: 'Telling an opposite-sex friend "you look cute today"', jp: '異性に「今日かわいいね」と言う' },
  { id: 13, text: "Noticing an opposite-sex friend's new haircut or outfit and complimenting it", jp: '異性の髪型や服装の変化に気づいて褒める' },
  { id: 14, text: 'Owning matching items with an opposite-sex friend', jp: '異性の友達とお揃いの物を持っている' },
  { id: 15, text: 'Posting a photo of you and an opposite-sex friend together on social media', jp: '異性の友達とのツーショットをSNSに載せる' },
  { id: 16, text: 'Keeping photos of you and someone of the opposite sex on your phone', jp: '異性とのツーショットをスマホに残している' },
  { id: 17, text: 'Calling each other by nicknames only the two of you use', jp: '異性の友達にだけ通じるあだ名で呼び合う' },
  { id: 18, text: 'Getting excited reminiscing with an opposite-sex friend about memories only you two share', jp: '異性の友達と二人だけの思い出話で盛り上がる' },
  { id: 19, text: "Being told by someone of the opposite sex that you're their closest opposite-sex friend", jp: '異性から「一番仲良い異性の友達」と言われる' },
  { id: 20, text: 'Laughing it off when an opposite-sex friend jokes, "dating you would be fun"', jp: '異性に「○○と付き合ったら楽しそう」と冗談ぽく言われて笑って流す' },
  { id: 21, text: 'Meeting up one-on-one to listen when an opposite-sex friend is feeling down', jp: '異性の友達が落ち込んでいるので二人で会って話を聞く' },
  { id: 22, text: 'Driving an opposite-sex friend home after they missed the last train', jp: '終電を逃した異性を車で家まで送る' },
  { id: 23, text: "Taking care of an opposite-sex friend who's drunk", jp: '異性の友達が酔っているので介抱する' },
  { id: 24, text: 'Comforting an opposite-sex friend who was crying', jp: '異性の友達が泣いていたので慰める' },
  { id: 25, text: 'Lending your jacket to someone of the opposite sex who looks cold', jp: '寒そうな異性に上着を貸す' },
  { id: 26, text: 'Helping an opposite-sex friend move, just the two of you', jp: '異性の友達の引っ越しを二人で手伝う' },
  { id: 27, text: 'Dropping everything to meet an opposite-sex friend who texts "can you meet up right now?"', jp: '異性の友達から「今から会えない？」と言われて会いに行く' },
  { id: 28, text: 'Going shopping one-on-one with an opposite-sex friend and having them pick out clothes for you', jp: '異性の友達と二人で買い物に行って服を選んでもらう' },
  { id: 29, text: 'Going to karaoke one-on-one with an opposite-sex friend', jp: '異性の友達と二人でカラオケ' },
  { id: 30, text: 'Going to a theme park one-on-one with an opposite-sex friend', jp: '異性の友達と二人でテーマパーク' },
  { id: 31, text: 'Still following your ex on social media', jp: '元恋人のSNSをフォローしたまま' },
  { id: 32, text: "Liking your ex's posts", jp: '元恋人の投稿にいいねする' },
  { id: 33, text: 'Replying to a "Happy New Year" text from your ex', jp: '元恋人から「あけおめ」が来たので返す' },
  { id: 34, text: 'Replying "Thank you!" to a happy-birthday text from your ex', jp: '元恋人から誕生日おめでとうLINEが来て「ありがとう！」と返す' },
  { id: 35, text: "Still using a wallet your ex gave you as if nothing's changed", jp: '元恋人にもらった財布を普通に使い続ける' },
  { id: 36, text: 'Not having deleted the photos of you and your ex', jp: '元恋人との写真を消していない' },
  { id: 37, text: 'Taking your current partner to a place that holds memories of you and your ex', jp: '元恋人との思い出の場所に今の恋人と行く' },
  { id: 38, text: "Chatting normally with your ex at a mutual friend's wedding", jp: '共通の友達の結婚式で元恋人と普通に話す' },
  { id: 39, text: 'Feeling genuinely glad when you hear your ex has a new partner', jp: '元恋人に新しい恋人ができたと聞いて「よかった」と思う' },
  { id: 40, text: 'Exchanging just a few "it\'s been a while, how are you?" messages with your ex', jp: '元恋人から「久しぶり、元気？」と来て、数往復だけ近況報告' },
]

// Bands verified from the original source: <=15 / <=35 / <=55 / <=80.
export const RESULT_TIERS: ResultTier[] = [
  {
    min: 0,
    name: 'The Easygoing Truster',
    jp: 'おおらか信頼派',
    description:
      'You are OK with almost everything on this sheet. You trust your partner and give them plenty of freedom.',
  },
  {
    min: 16,
    name: 'The Balanced Realist',
    jp: 'バランス常識派',
    description:
      'You are generous about friendships with others, but you have a clear line that must not be crossed.',
  },
  {
    min: 36,
    name: 'The Slightly Worried',
    jp: 'ちょっぴり心配派',
    description:
      '"Not cheating, but uncomfortable" is your most common answer. The little things tend to nag at you.',
  },
  {
    min: 56,
    name: 'The Iron-Wall Guardian',
    jp: '鉄壁ガード派',
    description:
      'You draw the line firmly and without exceptions. You want your partner\'s eyes only on you.',
  },
]

export const ATTRIBUTION =
  'Original "Is This Cheating?" judgment sheet by Sukoya Kana (@sukosuko_sukoya). Sheet design by Aria (@air_trpg). Web version by ikura1. Unofficial English fan version.'

export const ORIGINAL_SITE_URL = 'https://ikura1.github.io/uwaki-hantei/'

export function getTier(score: number): ResultTier {
  let tier = RESULT_TIERS[0]
  for (const t of RESULT_TIERS) {
    if (score >= t.min) tier = t
  }
  return tier
}

export function computeScore(answers: Answers): number {
  let score = 0
  for (const q of QUESTIONS) {
    const a = answers[q.id]
    if (!a) continue
    score += ANSWER_OPTIONS.find((o) => o.id === a)!.points
  }
  return score
}

export function countAnswers(answers: Answers): Record<AnswerId, number> {
  const counts: Record<AnswerId, number> = { cheating: 0, uncomfortable: 0, ok: 0 }
  for (const a of Object.values(answers)) counts[a]++
  return counts
}
