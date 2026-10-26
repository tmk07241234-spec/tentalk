/**
 * Draft legal and support documents. These are starting drafts written from the
 * app's actual rules; they must be reviewed by a qualified professional and the
 * bracketed placeholders filled in before release. Available in Japanese, English,
 * Korean, and Spanish; the Japanese text is the reference version.
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
      { h: 'フォローはどうすればできますか？', p: ['10分話しきった相手だけフォローできます。ランダム通話ではプロフィールが公開されたとき、リクエスト通話では10分話しきったあとに、相手のプロフィールにフォローのボタンが出ます。いいねやコメントなどの機能はありません。'] },
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
      { h: 'How do I follow someone?', p: ['You can follow only people you finished a 10-minute call with. After a random call that opened both profiles, or a requested call that reached 10 minutes, a Follow button appears on their profile. There are no likes or comments.'] },
      { h: 'Practice buddy vs. language exchange?', p: ['Practice buddies learn the same language, have different native languages, and talk only in that language. A language exchange is with a native speaker, half in each language.'] },
      { h: 'Can others see my trust score?', p: ['Only you see the number. Others see only “Trusted” or “New”.'] },
    ],
  },
};

const ko: Record<DocId, LegalDoc> = {
  terms: {
    title: '이용약관', updated: '2026년 10월 (초안)',
    sections: [
      { h: '1. 서비스 소개', p: [`Tentalk(이하 “서비스”)는 ${OPERATOR_EN}(이하 “운영자”)가 제공하는, 1대1 음성 통화로 어학을 연습하는 서비스입니다.`] },
      { h: '2. 이용 자격', p: ['만 18세 이상만 이용할 수 있습니다. 가입 시 생년월일을 확인하며, 만 18세 미만으로 확인된 계정은 정지됩니다.'] },
      { h: '3. 계정', p: ['Apple, Google, 이메일 주소 중 하나로 가입합니다. 계정은 본인만 사용할 수 있으며 양도하거나 공유할 수 없습니다.'] },
      { h: '4. 통화 규칙', p: [
        '통화는 1대1입니다. 처음 10분은 필수이며, 그 후에는 시간 제한이 없습니다.',
        '필수 10분 이내에 스스로 통화를 끝내면 신뢰 점수가 내려가고 일정 시간 랜덤 통화를 이용할 수 없습니다. 신고로 인한 종료, 연결 끊김, 상대방의 종료는 해당하지 않습니다.',
        '랜덤 통화에서는 두 사람 모두 10분 이상 대화한 경우에만 서로의 프로필이 공개됩니다.',
      ] },
      { h: '5. 금지 행위', p: ['커뮤니티 가이드라인에서 정한 행위를 금지합니다. 특히 성적인 발언, 폭언이나 차별, 권유·광고·사기, “어학 전용” 이용자에 대한 연애·만남 목적의 접근, 미성년자의 이용을 금지합니다.'] },
      { h: '6. 신고와 검토', p: [
        '이용자는 통화 중 언제든지 상대를 신고하고 통화를 끝낼 수 있습니다. 신고할 때만 검토를 위해 직전 60초의 음성이 운영자에게 전송됩니다.',
        '운영자는 원칙적으로 24시간 이내에 신고를 확인하고, 위반이 확인되면 신뢰 점수 감점, 이용 정지 등의 조치를 취합니다. 허위로 판단된 신고나, 30일 안에 확인되지 않은 신고가 3번 이상이면 신고자에게 조치할 수 있습니다.',
      ] },
      { h: '7. 유료 플랜', p: ['유료 플랜(Tentalk Plus)은 App Store 또는 Google Play 결제로 구매하며, 기간 종료 24시간 전까지 해지하지 않으면 자동으로 갱신됩니다. 각 스토어의 구독 관리에서 해지할 수 있습니다. 유료 플랜은 통화 시간, 매칭, 신뢰 점수에 영향을 주지 않습니다.'] },
      { h: '8. 면책', p: ['운영자에게 고의 또는 중대한 과실이 있는 경우를 제외하고, 운영자는 이용자 간 대화 내용이나 통화로 생긴 분쟁에 책임을 지지 않습니다.'] },
      { h: '9. 약관 변경', p: ['약관을 변경할 때는 앱 내 공지로 미리 안내합니다.'] },
      { h: '10. 준거법과 관할', p: ['이 약관은 일본 법률을 따릅니다. 분쟁이 생기면 [법원명]을 제1심의 전속적 합의 관할 법원으로 합니다.'] },
    ],
  },
  privacy: {
    title: '개인정보처리방침', updated: '2026년 10월 (초안)',
    sections: [
      { h: '1. 수집하는 정보', p: [
        '계정 정보: 가입에 사용한 Apple / Google 계정의 식별자, 이메일 주소.',
        '프로필: 이름, 아이콘, 자기소개, 음성 소개, 모국어와 학습 언어, 레벨, 취미, 대화 가능한 시간, 시간대.',
        '생년월일: 만 18세 이상인지 확인하는 데만 사용하며, 다른 이용자에게 표시하지 않습니다.',
        '이용 정보: 통화 상대, 일시, 길이, 신뢰 점수, 팔로우, 차단, 알림.',
        '통화 음성은 녹음하거나 저장하지 않습니다. 단, 신고한 경우에 한해 기기에 임시로 보관된 직전 60초의 음성을 검토를 위해 전송합니다.',
        '기기 정보: 기기 종류, OS, 언어 설정, 푸시 알림용 토큰.',
      ] },
      { h: '2. 이용 목적', p: ['상대 소개와 통화 제공, 부정 이용 방지와 신고 검토, 문의 대응, 서비스 개선을 위해 이용합니다.'] },
      { h: '3. 제3자 제공', p: ['법령에 따른 경우를 제외하고 본인의 동의 없이 제3자에게 제공하지 않습니다. 서비스 제공에 필요한 범위에서 클라우드, 인증, 통화 사업자에게 처리를 위탁합니다. 광고를 표시하는 경우 그 사업자와 제공하는 정보를 이 방침에 추가합니다.'] },
      { h: '4. 보관 기간과 삭제', p: ['계정을 삭제하면 프로필, 기록, 팔로우, 신뢰 점수를 삭제합니다. 신고 기록은 부정 방지를 위해 최대 [기간] 보관한 뒤 삭제합니다. 계정 삭제는 앱의 “나” → “계정 삭제”에서 할 수 있습니다.'] },
      { h: '5. 문의', p: [`개인정보 처리에 관한 문의는 ${CONTACT}로 연락해 주세요.`] },
    ],
  },
  guidelines: {
    title: '커뮤니티 가이드라인', updated: '2026년 10월 (초안)',
    sections: [
      { h: 'Tentalk에서 소중히 여기는 것', p: ['이곳은 어학을 연습하는 곳입니다. 상대도 연습 중이라는 것을 잊지 말고, 천천히 친절하게 이야기해 주세요.'] },
      { h: '금지하는 것', p: [
        '성적인 발언, 성적인 내용으로의 유도.',
        '폭언, 차별, 괴롭힘.',
        '권유, 광고, 사기, 외부 서비스로의 유도.',
        '“어학 전용” 이용자에 대한 연애·만남 목적의 접근.',
        '만 18세 미만의 이용, 다른 사람 사칭.',
      ] },
      { h: '규칙을 지키지 않으면', p: [
        '필수 10분 이내에 스스로 끊음: 신뢰 점수 −10, 랜덤 통화 30분 정지.',
        '위반이 확인됨: 신뢰 점수 −30과 이용 정지. 성적인 내용이나 권유는 즉시 정지.',
        '허위 신고, 또는 30일 안에 확인되지 않은 신고 3번 이상: 신뢰 점수 −10.',
      ] },
      { h: '곤란할 때는', p: ['통화 중 깃발 버튼으로 언제든 한 번에 신고하고 통화를 끝낼 수 있습니다. 한 번의 신고로 불이익을 받지는 않습니다.'] },
    ],
  },
  tokusho: {
    title: '특정상거래법에 따른 표기 (일본)', updated: '2026년 10월 (초안)',
    sections: [
      { h: '판매 사업자', p: [OPERATOR_EN] },
      { h: '운영 책임자·소재지·전화번호', p: ['요청이 있으면 지체 없이 공개합니다.'] },
      { h: '문의', p: [CONTACT] },
      { h: '판매 가격', p: ['Tentalk Plus 월 [480]엔, 연 [3,800]엔 (세금 포함).'] },
      { h: '결제 방법', p: ['App Store 또는 Google Play 결제. 각 스토어의 규정에 따릅니다.'] },
      { h: '제공 시기', p: ['구매 완료 후 바로 이용할 수 있습니다.'] },
      { h: '해지·환불', p: ['각 스토어의 구독 관리에서 해지할 수 있습니다. 환불은 각 스토어의 규정에 따릅니다.'] },
    ],
  },
  faq: {
    title: '자주 묻는 질문', updated: '',
    sections: [
      { h: '10분 전에 통화가 끊기면?', p: ['60초 안에 다시 연결되면 그대로 이어집니다. 연결 끊김은 불이익이 되지 않습니다.'] },
      { h: '랜덤으로 대화한 상대의 프로필이 보이지 않아요', p: ['두 사람 모두 10분 이상 대화한 경우에만 공개됩니다. 공개된 상대는 “기록”에서 언제든 볼 수 있습니다.'] },
      { h: '채팅할 수 있나요?', p: ['할 수 없습니다. 상대와 연결되는 방법은 10분 통화 요청뿐입니다.'] },
      { h: '팔로우는 어떻게 하나요?', p: ['10분 대화를 끝까지 한 상대만 팔로우할 수 있어요. 랜덤 통화에서 프로필이 공개되었거나 요청 통화에서 10분을 채우면 상대 프로필에 팔로우 버튼이 나타나요. 좋아요나 댓글 기능은 없어요.'] },
      { h: '“연습 친구”와 “언어 교환”의 차이는?', p: ['연습 친구는 같은 언어를 배우고 모국어가 다른 사람과 그 언어로만 대화합니다. 언어 교환은 원어민과 두 언어를 반씩 사용합니다.'] },
      { h: '신뢰 점수가 다른 사람에게 보이나요?', p: ['숫자는 나만 볼 수 있습니다. 다른 사람에게는 “신뢰됨” 또는 “신규”로만 보입니다.'] },
    ],
  },
};

const es: Record<DocId, LegalDoc> = {
  terms: {
    title: 'Términos del servicio', updated: 'Octubre de 2026 (borrador)',
    sections: [
      { h: '1. Sobre el servicio', p: [`Tentalk (el “Servicio”) lo ofrece ${OPERATOR_EN} (el “Operador”) para practicar idiomas mediante llamadas de voz uno a uno.`] },
      { h: '2. Quién puede usarlo', p: ['Debes tener 18 años o más. Comprobamos tu fecha de nacimiento al registrarte y suspendemos las cuentas de menores de 18 años.'] },
      { h: '3. Tu cuenta', p: ['Te registras con Apple, Google o un correo electrónico. La cuenta es solo para ti y no puede transferirse ni compartirse.'] },
      { h: '4. Normas de las llamadas', p: [
        'Las llamadas son uno a uno. Los primeros 10 minutos son obligatorios; después no hay límite de tiempo.',
        'Si cuelgas antes de 10 minutos, baja tu puntuación de confianza y las llamadas aleatorias se pausan durante un tiempo. No cuenta si terminas por una denuncia, si se corta la conexión o si cuelga la otra persona.',
        'En las llamadas aleatorias, los perfiles solo se abren si ambos hablan 10 minutos o más.',
      ] },
      { h: '5. Conductas prohibidas', p: ['Están prohibidas las conductas de las Normas de la comunidad, en especial los comentarios sexuales, los insultos o la discriminación, la captación, la publicidad o las estafas, los acercamientos románticos o para citas a usuarios con “Solo idiomas” y el uso por menores de 18 años.'] },
      { h: '6. Denuncias y revisión', p: [
        'Puedes denunciar a la otra persona y terminar la llamada en cualquier momento. Solo al denunciar, se envían al Operador los últimos 60 segundos de audio para revisarlos.',
        'Intentamos revisar las denuncias en 24 horas y podemos bajar la puntuación o suspender cuentas si se confirma una infracción. Las denuncias falsas, o 3 o más sin confirmar en 30 días, pueden conllevar medidas contra quien denuncia.',
      ] },
      { h: '7. Plan de pago', p: ['Tentalk Plus se compra en App Store o Google Play y se renueva automáticamente salvo que canceles al menos 24 horas antes de que termine el periodo. Puedes cancelar en la gestión de suscripciones de tu tienda. El plan de pago no afecta al tiempo de llamada, al emparejamiento ni a la puntuación de confianza.'] },
      { h: '8. Exención de responsabilidad', p: ['Salvo dolo o negligencia grave, el Operador no se responsabiliza de lo que los usuarios se dicen ni de los conflictos derivados de las llamadas.'] },
      { h: '9. Cambios', p: ['Anunciaremos con antelación en la app cualquier cambio de estos términos.'] },
      { h: '10. Ley aplicable', p: ['Estos términos se rigen por las leyes de Japón. El [nombre del tribunal] tendrá jurisdicción exclusiva en primera instancia.'] },
    ],
  },
  privacy: {
    title: 'Política de privacidad', updated: 'Octubre de 2026 (borrador)',
    sections: [
      { h: '1. Qué recopilamos', p: [
        'Cuenta: el identificador de la cuenta de Apple o Google con la que te registraste y tu correo electrónico.',
        'Perfil: nombre, icono, “sobre ti”, presentación de voz, idioma nativo y los que aprendes, niveles, aficiones, horario disponible y zona horaria.',
        'Fecha de nacimiento: solo para comprobar que tienes 18 años o más; nunca se muestra a otros usuarios.',
        'Uso: con quién hablas, fechas, duración, puntuación de confianza, seguidos, bloqueos y avisos.',
        'No grabamos ni guardamos el audio de las llamadas. Solo cuando denuncias, se envían para revisión los últimos 60 segundos guardados temporalmente en tu dispositivo.',
        'Dispositivo: modelo, sistema operativo, idioma y token de notificaciones.',
      ] },
      { h: '2. Para qué lo usamos', p: ['Para presentarte compañeros y ofrecer las llamadas, evitar abusos y revisar denuncias, responder a tus consultas y mejorar el Servicio.'] },
      { h: '3. Con quién lo compartimos', p: ['No compartimos tu información con terceros sin tu consentimiento salvo que la ley lo exija. Usamos proveedores de nube, autenticación y llamadas para el Servicio. Si mostramos anuncios, indicaremos aquí el proveedor y los datos compartidos.'] },
      { h: '4. Conservación y eliminación', p: ['Al eliminar tu cuenta, borramos tu perfil, historial, seguidos y puntuación de confianza. Los registros de denuncias se guardan como máximo [periodo] para evitar abusos y después se eliminan. Puedes eliminar tu cuenta en la app desde Yo → Eliminar cuenta.'] },
      { h: '5. Contacto', p: [`Para consultas sobre privacidad, escribe a ${CONTACT}.`] },
    ],
  },
  guidelines: {
    title: 'Normas de la comunidad', updated: 'Octubre de 2026 (borrador)',
    sections: [
      { h: 'Lo que importa aquí', p: ['Este es un lugar para practicar idiomas. La otra persona también está aprendiendo, así que habla despacio y con amabilidad.'] },
      { h: 'No está permitido', p: [
        'Comentarios sexuales o llevar la conversación hacia contenido sexual.',
        'Insultos, discriminación o acoso.',
        'Captación, publicidad, estafas o llevar a otras personas a otros servicios.',
        'Acercamientos románticos o para citas a usuarios con “Solo idiomas”.',
        'El uso por menores de 18 años o hacerse pasar por otra persona.',
      ] },
      { h: 'Si no se cumplen las normas', p: [
        'Colgar antes de 10 minutos: puntuación de confianza −10 y sin llamadas aleatorias durante 30 minutos.',
        'Infracción confirmada: puntuación −30 y suspensión. El contenido sexual o la captación suponen suspensión inmediata.',
        'Denuncias falsas, o 3 o más sin confirmar en 30 días: puntuación −10.',
      ] },
      { h: 'Si algo va mal', p: ['Toca la bandera durante la llamada para denunciar y terminarla con un toque. Una sola denuncia nunca te penaliza.'] },
    ],
  },
  tokusho: {
    title: 'Aviso comercial (Japón)', updated: 'Octubre de 2026 (borrador)',
    sections: [
      { h: 'Vendedor', p: [OPERATOR_EN] },
      { h: 'Responsable, dirección y teléfono', p: ['Se facilitan sin demora a quien lo solicite.'] },
      { h: 'Contacto', p: [CONTACT] },
      { h: 'Precio', p: ['Tentalk Plus: [480 ¥] al mes, [3.800 ¥] al año (impuestos incluidos).'] },
      { h: 'Pago', p: ['A través de App Store o Google Play, según las condiciones de cada tienda.'] },
      { h: 'Entrega', p: ['Disponible inmediatamente después de la compra.'] },
      { h: 'Cancelación y reembolsos', p: ['Cancela en la gestión de suscripciones de tu tienda. Los reembolsos siguen la política de cada tienda.'] },
    ],
  },
  faq: {
    title: 'Preguntas frecuentes', updated: '',
    sections: [
      { h: '¿Y si la llamada se corta antes de 10 minutos?', p: ['Si te reconectas en 60 segundos, la llamada continúa. Un corte de conexión nunca cuenta en tu contra.'] },
      { h: 'No veo el perfil de alguien con quien hablé en una llamada aleatoria', p: ['Los perfiles solo se abren si ambos hablan 10 minutos o más. Los perfiles abiertos siguen disponibles en el Historial.'] },
      { h: '¿Puedo chatear?', p: ['No. La única forma de contactar con alguien es pedir una llamada de 10 minutos.'] },
      { h: '¿Cómo sigo a alguien?', p: ['Solo puedes seguir a quienes completaron contigo una llamada de 10 minutos. Tras una llamada aleatoria que abrió los perfiles, o una solicitada que llegó a 10 minutos, aparece el botón Seguir en su perfil. No hay «me gusta» ni comentarios.'] },
      { h: '¿Compañero de práctica o intercambio?', p: ['Los compañeros de práctica aprenden el mismo idioma, tienen idiomas nativos distintos y hablan solo en ese idioma. El intercambio es con un nativo, mitad en cada idioma.'] },
      { h: '¿Los demás ven mi puntuación de confianza?', p: ['Solo tú ves el número. Los demás solo ven “De confianza” o “Nuevo”.'] },
    ],
  },
};

const DOCS: Record<string, Record<DocId, LegalDoc>> = { ja, en, ko, es };

/** The document in the display language; English for any language without a translation. */
export function legalDoc(id: DocId, uiLang: string): { doc: LegalDoc; fallback: boolean } {
  const set = DOCS[uiLang];
  return set ? { doc: set[id], fallback: false } : { doc: en[id], fallback: true };
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
