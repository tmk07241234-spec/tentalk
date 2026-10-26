/**
 * Draft legal and support documents. These are starting drafts written from the
 * app's actual rules; they must be reviewed by a qualified professional and the
 * bracketed placeholders filled in before release. Japanese and English are
 * maintained; Korean and Spanish users see English until translations are reviewed.
 */
export type DocId = 'terms' | 'privacy' | 'guidelines' | 'tokusho' | 'faq';

export interface LegalDoc {
  title: string;
  updated: string;
  sections: { h: string; p: string[] }[];
}

const OPERATOR_JA = '〔運営者名〕';
const OPERATOR_EN = '[Operator name]';
const CONTACT = '〔support@example.com〕';

const ja: Record<DocId, LegalDoc> = {
  terms: {
    title: '利用規約', updated: '2026年10月（下書き）',
    sections: [
      { h: '1. このサービスについて', p: [`Tentalk（以下「本サービス」）は、${OPERATOR_JA}（以下「運営者」）が提供する、1対1の音声通話で語学を練習するためのサービスです。`] },
      { h: '2. 利用できる方', p: ['本サービスは18歳以上の方のみ利用できます。登録時に生年月日を確認し、18歳未満と判明した場合はアカウントを停止します。'] },
      { h: '3. アカウント', p: ['Apple、Google、メールアドレスのいずれかで登録します。アカウントは本人のみが利用でき、第三者への譲渡や共有はできません。'] },
      { h: '4. 通話のルール', p: [
        '通話は1対1です。最初の10分は必修で、その後は時間の制限はありません。',
        '必修の10分以内に自分から通話を終了すると、信頼スコアが下がり、ランダム通話が一定時間利用できなくなります。通報による終了、通信の切断、相手による終了はこの対象になりません。',
        'ランダム通話では、2人とも10分以上話した場合にのみ、お互いのプロフィールが公開されます。',
      ] },
      { h: '5. 禁止行為', p: ['コミュニティガイドラインに定める行為を禁止します。特に、性的な発言、暴言や差別、勧誘・宣伝・詐欺、「語学のみ」の利用者への恋愛・出会い目的の接触、未成年者の利用は禁止です。'] },
      { h: '6. 通報と審査', p: [
        '利用者は通話中いつでも相手を通報して通話を終了できます。通報時に限り、審査のために直前60秒の音声が運営者に送信されます。',
        '運営者は原則24時間以内に通報を確認し、違反が認められた場合は信頼スコアの減点、利用停止などの措置を取ります。虚偽と判断された通報や、確認できない通報が30日間に3回以上続いた場合は、通報者に措置を取ることがあります。',
      ] },
      { h: '7. 有料プラン', p: ['有料プラン（Tentalk Plus）は App Store または Google Play の決済で購入でき、期間終了の24時間前までに解約しない限り自動で更新されます。解約は各ストアのサブスクリプション管理から行えます。有料プランは通話時間、マッチング、信頼スコアには影響しません。'] },
      { h: '8. 免責', p: ['運営者は、利用者同士の会話の内容や、通話によって生じたトラブルについて、運営者に故意または重大な過失がある場合を除き責任を負いません。'] },
      { h: '9. 規約の変更', p: ['規約を変更する場合は、アプリ内のお知らせで事前に案内します。'] },
      { h: '10. 準拠法と管轄', p: ['本規約は日本法に準拠します。紛争が生じた場合は〔裁判所名〕を第一審の専属的合意管轄裁判所とします。'] },
    ],
  },
  privacy: {
    title: 'プライバシーポリシー', updated: '2026年10月（下書き）',
    sections: [
      { h: '1. 取得する情報', p: [
        'アカウント情報: 登録に使ったApple / Google アカウントの識別子、メールアドレス。',
        'プロフィール: 名前、アイコン、自己紹介、自己紹介の音声、母語と学習言語、レベル、趣味、話せる時間帯、タイムゾーン。',
        '生年月日: 18歳以上かどうかの確認にのみ使い、他の利用者には表示しません。',
        '利用状況: 通話の相手、日時、長さ、信頼スコア、フォロー、ブロック、通知。',
        '通話の音声は録音・保存しません。ただし通報した場合に限り、端末に一時的に保持している直前60秒の音声を審査のために送信します。',
        '端末情報: 端末の種類、OS、言語設定、プッシュ通知用のトークン。',
      ] },
      { h: '2. 利用目的', p: ['相手の紹介と通話の提供、不正利用の防止と通報の審査、お問い合わせへの対応、サービスの改善のために利用します。'] },
      { h: '3. 第三者への提供', p: ['法令に基づく場合を除き、本人の同意なく第三者に提供しません。サービスの提供に必要な範囲で、クラウド、認証、通話の各事業者に処理を委託します。広告を表示する場合は、その事業者と提供する情報をこのポリシーに追記します。'] },
      { h: '4. 保存期間と削除', p: ['アカウントを削除すると、プロフィール、履歴、フォロー、信頼スコアを削除します。通報の記録は、不正防止のため最長〔期間〕保存した後に削除します。アカウントの削除はアプリ内の「自分」→「アカウントを削除」から行えます。'] },
      { h: '5. お問い合わせ', p: [`個人情報の取り扱いに関するお問い合わせは ${CONTACT} までご連絡ください。`] },
    ],
  },
  guidelines: {
    title: 'コミュニティガイドライン', updated: '2026年10月（下書き）',
    sections: [
      { h: 'Tentalk で大切にしていること', p: ['ここは語学を練習する場所です。相手も練習中だということを忘れず、ゆっくり、やさしく話しましょう。'] },
      { h: '禁止していること', p: [
        '性的な発言、性的な内容への誘導。',
        '暴言、差別、嫌がらせ。',
        '勧誘、宣伝、詐欺、外部サービスへの誘導。',
        '「語学のみ」の人への恋愛・出会い目的の接触。',
        '18歳未満の利用、他人へのなりすまし。',
      ] },
      { h: 'ルールを守らなかった場合', p: [
        '必修の10分以内に自分から切る: 信頼スコア −10、ランダム通話を30分停止。',
        '違反が確認された: 信頼スコア −30 と利用停止。性的な内容や勧誘は即時停止。',
        '虚偽の通報、または30日で3回以上の確認できない通報: 信頼スコア −10。',
      ] },
      { h: '困ったときは', p: ['通話中の旗のボタンから、いつでも1タップで通報して通話を終了できます。1回の通報でペナルティを受けることはありません。'] },
    ],
  },
  tokusho: {
    title: '特定商取引法に基づく表記', updated: '2026年10月（下書き）',
    sections: [
      { h: '販売事業者', p: [OPERATOR_JA] },
      { h: '運営責任者・所在地・電話番号', p: ['請求があった場合は遅滞なく開示します。'] },
      { h: 'お問い合わせ', p: [CONTACT] },
      { h: '販売価格', p: ['Tentalk Plus 月額〔480〕円、年額〔3,800〕円（税込）。'] },
      { h: '支払方法・時期', p: ['App Store または Google Play の決済。各ストアの定めによります。'] },
      { h: '提供時期', p: ['購入手続きの完了後すぐに利用できます。'] },
      { h: '解約・返金', p: ['各ストアのサブスクリプション管理から解約できます。返金は各ストアの規定に従います。'] },
    ],
  },
  faq: {
    title: 'よくある質問', updated: '',
    sections: [
      { h: '10分以内に通話が切れてしまったら？', p: ['通信が切れた場合は、60秒以内に再接続すればそのまま続きます。通信の切断はペナルティになりません。'] },
      { h: 'ランダムで話した相手のプロフィールが見られません', p: ['2人とも10分以上話した場合だけ公開されます。公開された相手は「履歴」からいつでも見られます。'] },
      { h: 'チャットはできますか？', p: ['できません。相手とつながる方法は10分通話のリクエストだけです。'] },
      { h: '「練習仲間」と「言語交換」の違いは？', p: ['練習仲間は同じ言語を学ぶ、母語が違う人と、その言語だけで話します。言語交換はネイティブと、2つの言語を半分ずつ話します。'] },
      { h: '信頼スコアは他の人に見えますか？', p: ['数字はあなたにしか見えません。他の人には「信頼済み」か「新規」とだけ表示されます。'] },
    ],
  },
};

const en: Record<DocId, LegalDoc> = {
  terms: {
    title: 'Terms of Service', updated: 'October 2026 (draft)',
    sections: [
      { h: '1. About the service', p: [`Tentalk (the “Service”) is provided by ${OPERATOR_EN} (the “Operator”) for practicing languages through one-on-one voice calls.`] },
      { h: '2. Who can use it', p: ['You must be 18 or older. We check your date of birth at sign-up and suspend accounts found to belong to anyone under 18.'] },
      { h: '3. Your account', p: ['You sign up with Apple, Google, or an email address. Your account is for you alone and may not be transferred or shared.'] },
      { h: '4. Call rules', p: [
        'Calls are one on one. The first 10 minutes are required; after that there is no time limit.',
        'If you end a call yourself before 10 minutes, your trust score goes down and random calls are paused for a while. Ending by report, a dropped connection, or your partner ending the call does not count.',
        'In random calls, profiles open up only if both of you talk for 10 minutes or more.',
      ] },
      { h: '5. Prohibited conduct', p: ['The conduct listed in the Community Guidelines is prohibited, in particular sexual remarks, abuse or discrimination, solicitation, ads or scams, romantic or dating approaches to “Language only” users, and use by anyone under 18.'] },
      { h: '6. Reports and review', p: [
        'You can report your partner and end the call at any time. Only when you report, the last 60 seconds of audio are sent to the Operator for review.',
        'We aim to review reports within 24 hours and may lower trust scores or suspend accounts when a violation is confirmed. Reports judged false, or 3 or more unconfirmed reports within 30 days, may lead to action against the reporter.',
      ] },
      { h: '7. Paid plan', p: ['Tentalk Plus is purchased through the App Store or Google Play and renews automatically unless cancelled at least 24 hours before the period ends. You can cancel in your store’s subscription settings. The paid plan does not affect call time, matching, or trust scores.'] },
      { h: '8. Disclaimer', p: ['Except in cases of intent or gross negligence, the Operator is not responsible for what users say to each other or for disputes arising from calls.'] },
      { h: '9. Changes', p: ['We will announce changes to these terms in the app in advance.'] },
      { h: '10. Governing law', p: ['These terms are governed by the laws of Japan. The [court name] has exclusive jurisdiction in the first instance.'] },
    ],
  },
  privacy: {
    title: 'Privacy Policy', updated: 'October 2026 (draft)',
    sections: [
      { h: '1. What we collect', p: [
        'Account: the Apple or Google account identifier you signed up with, and your email address.',
        'Profile: name, icon, about you, voice intro, native and learning languages, levels, hobbies, available hours, time zone.',
        'Date of birth: used only to check that you are 18 or older; never shown to other users.',
        'Usage: call partners, dates, lengths, trust score, follows, blocks, notifications.',
        'We do not record or store call audio. Only when you report a partner, the last 60 seconds held temporarily on your device are sent for review.',
        'Device: device model, OS, language setting, push notification token.',
      ] },
      { h: '2. How we use it', p: ['To introduce partners and provide calls, prevent abuse and review reports, answer your inquiries, and improve the Service.'] },
      { h: '3. Sharing', p: ['We do not share your information with third parties without your consent unless required by law. We use cloud, authentication, and calling providers to run the Service. If we show ads, we will list the provider and the data shared in this policy.'] },
      { h: '4. Retention and deletion', p: ['When you delete your account, we delete your profile, history, follows, and trust score. Report records are kept for up to [period] to prevent abuse and then deleted. You can delete your account in the app from Me → Delete account.'] },
      { h: '5. Contact', p: [`For privacy questions, contact ${CONTACT}.`] },
    ],
  },
  guidelines: {
    title: 'Community guidelines', updated: 'October 2026 (draft)',
    sections: [
      { h: 'What matters here', p: ['This is a place to practice languages. Your partner is learning too, so speak slowly and kindly.'] },
      { h: 'Not allowed', p: [
        'Sexual remarks or steering toward sexual content.',
        'Abuse, discrimination, harassment.',
        'Solicitation, ads, scams, pushing people to other services.',
        'Romantic or dating approaches to “Language only” users.',
        'Use by anyone under 18, impersonating others.',
      ] },
      { h: 'If rules are broken', p: [
        'Ending a call yourself before 10 minutes: trust score −10 and no random calls for 30 minutes.',
        'Confirmed violation: trust score −30 and suspension. Sexual content or solicitation means immediate suspension.',
        'False reports, or 3 or more unconfirmed reports in 30 days: trust score −10.',
      ] },
      { h: 'If something goes wrong', p: ['Tap the flag during a call to report and end it in one tap. A single report never costs you anything.'] },
    ],
  },
  tokusho: {
    title: 'Commercial disclosure (Japan)', updated: 'October 2026 (draft)',
    sections: [
      { h: 'Seller', p: [OPERATOR_EN] },
      { h: 'Representative, address, phone', p: ['Disclosed without delay upon request.'] },
      { h: 'Contact', p: [CONTACT] },
      { h: 'Price', p: ['Tentalk Plus: [¥480] per month, [¥3,800] per year (tax included).'] },
      { h: 'Payment', p: ['Through the App Store or Google Play, according to each store’s terms.'] },
      { h: 'Delivery', p: ['Available immediately after purchase.'] },
      { h: 'Cancellation and refunds', p: ['Cancel in your store’s subscription settings. Refunds follow each store’s policy.'] },
    ],
  },
  faq: {
    title: 'FAQ', updated: '',
    sections: [
      { h: 'What if the call drops before 10 minutes?', p: ['Reconnect within 60 seconds and the call continues. A dropped connection never counts against you.'] },
      { h: 'I can’t see a random partner’s profile', p: ['Profiles open only if both of you talk for 10 minutes or more. Opened profiles stay available in History.'] },
      { h: 'Can I chat?', p: ['No. The only way to reach someone is a request for a 10-minute call.'] },
      { h: 'Practice buddy vs. language exchange?', p: ['Practice buddies learn the same language, have different native languages, and talk only in that language. A language exchange is with a native speaker, half in each language.'] },
      { h: 'Can others see my trust score?', p: ['Only you see the number. Others see only “Trusted” or “New”.'] },
    ],
  },
};

/** Japanese for Japanese UI; English for everyone else until other translations are reviewed. */
export function legalDoc(id: DocId, uiLang: string): { doc: LegalDoc; fallback: boolean } {
  if (uiLang === 'ja') return { doc: ja[id], fallback: false };
  return { doc: en[id], fallback: uiLang !== 'en' };
}

/** Direct dependencies and their licenses (regenerate when dependencies change). */
export const LICENSES: [name: string, version: string, license: string][] = [
  ['@expo/metro-runtime', '58.0.15', 'MIT'], ['@expo/vector-icons', '15.1.1', 'MIT'], ['@react-native-async-storage/async-storage', '2.2.0', 'MIT'],
  ['expo', '58.0.19', 'MIT'], ['expo-audio', '58.0.10', 'MIT'], ['expo-constants', '58.0.13', 'MIT'], ['expo-image-picker', '58.0.10', 'MIT'],
  ['expo-linking', '58.0.14', 'MIT'], ['expo-localization', '58.0.5', 'MIT'], ['expo-router', '58.0.26', 'MIT'], ['expo-status-bar', '58.0.4', 'MIT'],
  ['i18next', '26.5.7', 'MIT'], ['react', '19.3.0', 'MIT'], ['react-dom', '19.3.0', 'MIT'], ['react-i18next', '17.1.5', 'MIT'], ['react-native', '0.88.0', 'MIT'],
  ['react-native-safe-area-context', '5.10.1', 'MIT'], ['react-native-screens', '4.30.0', 'MIT'], ['react-native-svg', '15.16.0', 'MIT'],
  ['react-native-web', '0.21.4', 'MIT'], ['zustand', '5.0.16', 'MIT'],
];
