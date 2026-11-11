/**
 * Legal and support documents, written from the app's actual behaviour (keep them in
 * step with it: what is stored, who processes it, penalties, paid features). A review
 * by a qualified professional is still recommended. Available in Japanese, English,
 * Korean, and Spanish; the Japanese text is the reference version.
 */
export type DocId = 'terms' | 'privacy' | 'guidelines' | 'tokusho' | 'faq';

export interface LegalDoc {
  title: string;
  updated: string;
  sections: { h: string; p: string[] }[];
}

const OPERATOR_JA = '渡邉 朋生';
const OPERATOR_EN = 'Tomoki Watanabe';
const CONTACT = 'tentalk.support@gmail.com';

const ja: Record<DocId, LegalDoc> = {
  terms: {
    title: '利用規約', updated: '2026年11月8日',
    sections: [
      { h: '1. このサービスについて', p: [`Tentalk（以下「本サービス」）は、${OPERATOR_JA}（以下「運営者」）が提供する、1対1の音声通話で語学を練習するためのサービスです。`] },
      { h: '2. 利用できる方', p: ['本サービスは18歳以上の方のみ利用できます。登録時に生年月日を確認し、18歳未満と判明した場合はアカウントを停止します。'] },
      { h: '3. アカウント', p: ['メールアドレス（対応している端末では Google アカウントも）で登録します。アカウントは本人のみが利用でき、第三者への譲渡や共有はできません。'] },
      { h: '4. 通話のルール', p: [
        '通話は1対1です。最初の10分は必修で、その後は時間の制限はありません。',
        '必修の10分以内に自分から通話を終了すると、信頼スコアが下がり、クイックマッチが一定時間利用できなくなります。通報による終了、通信の切断、相手による終了はこの対象になりません。',
        'クイックマッチでは、通話の前に相手の名前・写真・言語・自己紹介が表示され、2人とも「話す」を選んだ場合にだけ通話が始まります。どちらかがスキップすれば通話は始まりません。',
      ] },
      { h: '5. 禁止行為', p: ['コミュニティガイドラインに定める行為を禁止します。特に、性的な発言、暴言や差別、勧誘・宣伝・詐欺、「語学のみ」の利用者への恋愛・出会い目的の接触、未成年者の利用は禁止です。運営者は、不適切な内容や迷惑行為を一切容認しません。'] },
      { h: '6. 通報と審査', p: [
        '利用者は通話中いつでも相手を通報して通話を終了できます。プロフィールからも通報できます。通報すると、通報の理由と、相手・通話の日時などの情報が運営者に送られます。通話の音声は録音も送信もしません。',
        '通報した相手は自動でブロックされ、通報した人の画面や一覧に表示されなくなります。運営者は通報を24時間以内に確認し、違反が認められた場合は、不適切なプロフィール内容の削除、信頼スコアの減点、違反者の利用停止などの措置を取ります。虚偽と判断された通報には、通報者に措置を取ることがあります。',
      ] },
      { h: '7. 料金', p: ['本サービスは無料で利用できます。有料の機能を始める場合は、内容・料金・支払方法を事前にアプリ内で案内し、この規約を更新します。'] },
      { h: '8. 免責', p: ['運営者は、利用者同士の会話の内容や、通話によって生じたトラブルについて、運営者に故意または重大な過失がある場合を除き責任を負いません。'] },
      { h: '9. 規約の変更', p: ['規約を変更する場合は、アプリ内のお知らせで事前に案内します。'] },
      { h: '10. 準拠法と管轄', p: ['本規約は日本法に準拠します。紛争が生じた場合は、運営者の住所地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。'] },
    ],
  },
  privacy: {
    title: 'プライバシーポリシー', updated: '2026年11月8日',
    sections: [
      { h: '1. 取得する情報', p: [
        'アカウント情報: メールアドレス、アカウントの識別子（Google で登録した場合は Google アカウントの識別子）。',
        'プロフィール: 名前、写真、自己紹介、自己紹介の音声、母語と学習言語、レベル、趣味、話せる時間帯、時差（端末の時計の設定）。プロフィールは他の利用者に表示されます。',
        '生年月日: 登録時に端末上で18歳以上かどうかを確認するためだけに使い、運営者のサーバーには保存しません。',
        '利用状況: 通話の相手、日時、長さ、信頼スコア、フォロー、ブロック、通話リクエスト、オンライン状態（最後に利用した時刻）。',
        '通報とお問い合わせ: 通報の理由と対象、お問い合わせの内容と返信先のメールアドレス。',
        '通話の音声は、相手に届けるために通話事業者のサーバーを経由しますが、録音・保存はしません。',
        'プッシュ通知用のトークンと、アプリの表示言語。位置情報、連絡先、広告ID は取得しません。',
      ] },
      { h: '2. 利用目的', p: ['相手の紹介と通話の提供、不正利用の防止と通報の審査、お問い合わせへの対応、サービスの改善のために利用します。'] },
      { h: '3. 第三者への提供と委託', p: [
        '法令に基づく場合を除き、本人の同意なく第三者に提供しません。広告やトラッキングのために情報を提供・利用することはありません。',
        'サービスの提供に必要な範囲で、次の事業者に処理を委託しています。Google（Firebase：認証、データベース、ファイルの保存）、LiveKit（音声通話の中継）、Expo（サーバーの運用、アプリの更新、プッシュ通知）、Apple（iPhone へのプッシュ通知）。これらの事業者は主に米国などのサーバーで情報を処理し、各社の基準で安全管理を行っています。',
      ] },
      { h: '4. 保存期間と削除', p: ['アカウントを削除すると、プロフィール、写真と音声、履歴、フォロー、信頼スコアを削除します。通報と利用停止の記録、お問い合わせは、不正防止と対応のために必要な期間保存し、不要になったものは削除します。アカウントの削除はアプリ内の「自分」→「アカウントを削除」から行えます。'] },
      { h: '5. 開示・訂正・削除のご請求とお問い合わせ', p: [`ご自身の情報の開示、訂正、利用停止、削除のご請求や、個人情報の取り扱いに関するお問い合わせは ${CONTACT} までご連絡ください。ご本人であることを確認したうえで、遅滞なく対応します。`] },
      { h: '6. 運営者', p: [`${OPERATOR_JA}。住所は、請求があった場合に遅滞なく開示します。`] },
    ],
  },
  guidelines: {
    title: 'コミュニティガイドライン', updated: '2026年11月8日',
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
        '必修の10分以内に自分から切る: 信頼スコア −10、クイックマッチを30分停止。',
        '違反が確認された: 信頼スコア −30。性的な内容や勧誘など重い違反は、あわせて7日間の利用停止。繰り返す場合は、さらに長い利用停止。',
        '虚偽と判断された通報: 信頼スコア −10。',
      ] },
      { h: '困ったときは', p: ['通話中の旗のボタンから、いつでも1タップで通報して通話を終了できます。1回の通報でペナルティを受けることはありません。'] },
    ],
  },
  tokusho: {
    title: '特定商取引法に基づく表記', updated: '2026年11月8日',
    sections: [
      { h: '現在の販売', p: ['本サービスは無料で、現在、有料の商品やサービスの販売はありません。有料の機能を始める際に、販売価格、支払方法、解約・返金などをこのページに掲載します。'] },
      { h: '運営者', p: [OPERATOR_JA] },
      { h: '所在地・電話番号', p: ['請求があった場合は遅滞なく開示します。'] },
      { h: 'お問い合わせ', p: [CONTACT] },
    ],
  },
  faq: {
    title: 'よくある質問', updated: '',
    sections: [
      { h: '10分以内に通話が切れてしまったら？', p: ['通信が一時的に途切れた場合は、自動で再接続を試みます。通信の切断によって通話が終わっても、ペナルティにはなりません。'] },
      { h: 'クイックマッチで知らない人といきなりつながりますか？', p: ['いいえ。相手が見つかると、まず名前・写真・言語・自己紹介が表示され、「話す」か「スキップ」を選べます。2人とも「話す」を選んだときだけ通話が始まります。話した相手は「履歴」からいつでも見られます。'] },
      { h: 'チャットはできますか？', p: ['できません。相手とつながる方法は10分通話のリクエストだけです。'] },
      { h: 'フォローはどうすればできますか？', p: ['10分話しきった相手だけフォローできます。10分話しきったあとに、相手のプロフィールにフォローのボタンが出ます。いいねやコメントなどの機能はありません。'] },
      { h: '「練習仲間」と「言語交換」の違いは？', p: ['練習仲間は同じ言語を学ぶ、母語が違う人と、その言語だけで話します。言語交換はネイティブと、2つの言語を半分ずつ話します。'] },
      { h: '信頼スコアは他の人に見えますか？', p: ['数字はあなたにしか見えません。他の人には「信頼済み」か「新規」とだけ表示されます。'] },
    ],
  },
};

const en: Record<DocId, LegalDoc> = {
  terms: {
    title: 'Terms of Service', updated: 'November 8, 2026',
    sections: [
      { h: '1. About the service', p: [`Tentalk (the “Service”) is provided by ${OPERATOR_EN} (the “Operator”) for practicing languages through one-on-one voice calls.`] },
      { h: '2. Who can use it', p: ['You must be 18 or older. We check your date of birth at sign-up and suspend accounts found to belong to anyone under 18.'] },
      { h: '3. Your account', p: ['You sign up with an email address (or a Google account on supported devices). Your account is for you alone and may not be transferred or shared.'] },
      { h: '4. Call rules', p: [
        'Calls are one on one. The first 10 minutes are required; after that there is no time limit.',
        'If you end a call yourself before 10 minutes, your trust score goes down and quick matches are paused for a while. Ending by report, a dropped connection, or your partner ending the call does not count.',
        'In a quick match, you see the other person’s name, photo, languages and bio before the call, and the call starts only if you both choose to talk. If either of you skips, no call starts.',
      ] },
      { h: '5. Prohibited conduct', p: ['The conduct listed in the Community Guidelines is prohibited, in particular sexual remarks, abuse or discrimination, solicitation, ads or scams, romantic or dating approaches to “Language only” users, and use by anyone under 18. The Operator has zero tolerance for objectionable content and abusive users.'] },
      { h: '6. Reports and review', p: [
        'You can report your partner and end the call at any time, and you can also report from a profile. A report sends the Operator the reason and details such as who it concerns and when the call took place. Call audio is never recorded or sent.',
        'The person you report is blocked automatically and disappears from your screens and lists. We review every report within 24 hours and, when a violation is confirmed, remove the objectionable profile content, lower the trust score and suspend the user who provided it. Reports judged false may lead to action against the reporter.',
      ] },
      { h: '7. Price', p: ['The Service is free. Before we introduce any paid feature, we will explain its content, price and payment in the app and update these terms.'] },
      { h: '8. Disclaimer', p: ['Except in cases of intent or gross negligence, the Operator is not responsible for what users say to each other or for disputes arising from calls.'] },
      { h: '9. Changes', p: ['We will announce changes to these terms in the app in advance.'] },
      { h: '10. Governing law', p: ['These terms are governed by the laws of Japan. The district court with jurisdiction over the Operator’s address has exclusive jurisdiction in the first instance.'] },
    ],
  },
  privacy: {
    title: 'Privacy Policy', updated: 'November 8, 2026',
    sections: [
      { h: '1. What we collect', p: [
        'Account: your email address and account identifier (and your Google account identifier if you signed up with Google).',
        'Profile: name, photo, about you, voice intro, native and learning languages, levels, hobbies, available hours, and time difference (from your device’s clock). Your profile is shown to other users.',
        'Date of birth: checked on your device at sign-up only to confirm you are 18 or older; it is not stored on our servers.',
        'Usage: call partners, dates, lengths, trust score, follows, blocks, call requests, and online status (when you last used the app).',
        'Reports and inquiries: the reason and subject of reports, and the content of inquiries with the reply email address.',
        'Call audio passes through our calling provider’s servers to reach your partner, but it is never recorded or stored.',
        'Your push notification token and app language. We do not collect location, contacts, or advertising identifiers.',
      ] },
      { h: '2. How we use it', p: ['To introduce partners and provide calls, prevent abuse and review reports, answer your inquiries, and improve the Service.'] },
      { h: '3. Sharing and service providers', p: [
        'We do not share your information with third parties without your consent unless required by law. We never share or use it for advertising or tracking.',
        'To run the Service we use these providers: Google (Firebase: sign-in, database, file storage), LiveKit (relaying voice calls), Expo (servers, app updates, push notifications), and Apple (push notifications on iPhone). They process data mainly on servers in the United States and other countries and protect it under their own security standards.',
      ] },
      { h: '4. Retention and deletion', p: ['When you delete your account, we delete your profile, photo and voice intro, history, follows, and trust score. Records of reports and suspensions, and inquiries, are kept as long as needed to prevent abuse and respond, and deleted when no longer needed. You can delete your account in the app from Me → Delete account.'] },
      { h: '5. Your rights and contact', p: [`To access, correct, stop the use of, or delete your information, or for any privacy question, contact ${CONTACT}. We will respond without delay after confirming your identity.`] },
      { h: '6. Operator', p: [`${OPERATOR_EN}. The address is disclosed without delay upon request.`] },
    ],
  },
  guidelines: {
    title: 'Community guidelines', updated: 'November 8, 2026',
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
        'Ending a call yourself before 10 minutes: trust score −10 and no quick matches for 30 minutes.',
        'Confirmed violation: trust score −30. Serious violations such as sexual content or solicitation also mean a 7-day suspension, and longer if repeated.',
        'Reports judged false: trust score −10.',
      ] },
      { h: 'If something goes wrong', p: ['Tap the flag during a call to report and end it in one tap. A single report never costs you anything.'] },
    ],
  },
  tokusho: {
    title: 'Commercial disclosure (Japan)', updated: 'November 8, 2026',
    sections: [
      { h: 'Current sales', p: ['The Service is free and nothing is sold at the moment. When paid features start, this page will list prices, payment, cancellation and refunds.'] },
      { h: 'Operator', p: [OPERATOR_EN] },
      { h: 'Address and phone', p: ['Disclosed without delay upon request.'] },
      { h: 'Contact', p: [CONTACT] },
    ],
  },
  faq: {
    title: 'FAQ', updated: '',
    sections: [
      { h: 'What if the call drops before 10 minutes?', p: ['If the connection is interrupted briefly, the app tries to reconnect automatically. A call that ends because of a dropped connection never counts against you.'] },
      { h: 'Does a quick match connect me to a stranger straight away?', p: ['No. When someone is found, you first see their name, photo, languages and bio, and choose to talk or skip. The call starts only when you both choose to talk. People you talked with stay in History.'] },
      { h: 'Can I chat?', p: ['No. The only way to reach someone is a request for a 10-minute call.'] },
      { h: 'How do I follow someone?', p: ['You can follow only people you finished a 10-minute call with. After a call that reached 10 minutes, a Follow button appears on their profile. There are no likes or comments.'] },
      { h: 'Practice buddy vs. language exchange?', p: ['Practice buddies learn the same language, have different native languages, and talk only in that language. A language exchange is with a native speaker, half in each language.'] },
      { h: 'Can others see my trust score?', p: ['Only you see the number. Others see only “Trusted” or “New”.'] },
    ],
  },
};

const ko: Record<DocId, LegalDoc> = {
  terms: {
    title: '이용약관', updated: '2026년 11월 8일',
    sections: [
      { h: '1. 서비스 소개', p: [`Tentalk(이하 “서비스”)는 ${OPERATOR_EN}(이하 “운영자”)가 제공하는, 1대1 음성 통화로 어학을 연습하는 서비스입니다.`] },
      { h: '2. 이용 자격', p: ['만 18세 이상만 이용할 수 있습니다. 가입 시 생년월일을 확인하며, 만 18세 미만으로 확인된 계정은 정지됩니다.'] },
      { h: '3. 계정', p: ['이메일 주소(지원되는 기기에서는 Google 계정도)로 가입합니다. 계정은 본인만 사용할 수 있으며 양도하거나 공유할 수 없습니다.'] },
      { h: '4. 통화 규칙', p: [
        '통화는 1대1입니다. 처음 10분은 필수이며, 그 후에는 시간 제한이 없습니다.',
        '필수 10분 이내에 스스로 통화를 끝내면 신뢰 점수가 내려가고 일정 시간 빠른 통화를 이용할 수 없습니다. 신고로 인한 종료, 연결 끊김, 상대방의 종료는 해당하지 않습니다.',
        '빠른 통화에서는 통화 전에 상대의 이름, 사진, 언어, 자기소개가 표시되며, 두 사람 모두 “대화하기”를 고른 경우에만 통화가 시작됩니다. 어느 한쪽이 건너뛰면 통화는 시작되지 않습니다.',
      ] },
      { h: '5. 금지 행위', p: ['커뮤니티 가이드라인에서 정한 행위를 금지합니다. 특히 성적인 발언, 폭언이나 차별, 권유·광고·사기, “어학 전용” 이용자에 대한 연애·만남 목적의 접근, 미성년자의 이용을 금지합니다. 운영자는 부적절한 콘텐츠와 괴롭힘을 절대 용인하지 않습니다.'] },
      { h: '6. 신고와 검토', p: [
        '이용자는 통화 중 언제든지 상대를 신고하고 통화를 끝낼 수 있으며, 프로필에서도 신고할 수 있습니다. 신고하면 신고 사유와 상대, 통화 일시 등의 정보가 운영자에게 전송됩니다. 통화 음성은 녹음하거나 전송하지 않습니다.',
        '신고한 상대는 자동으로 차단되어 신고한 사람의 화면과 목록에서 보이지 않게 됩니다. 운영자는 신고를 24시간 안에 확인하고, 위반이 확인되면 부적절한 프로필 내용 삭제, 신뢰 점수 감점, 위반자의 이용 정지 등의 조치를 취합니다. 허위로 판단된 신고에는 신고자에게 조치할 수 있습니다.',
      ] },
      { h: '7. 요금', p: ['서비스는 무료로 이용할 수 있습니다. 유료 기능을 시작할 때는 내용, 요금, 결제 방법을 앱에서 미리 안내하고 이 약관을 변경합니다.'] },
      { h: '8. 면책', p: ['운영자에게 고의 또는 중대한 과실이 있는 경우를 제외하고, 운영자는 이용자 간 대화 내용이나 통화로 생긴 분쟁에 책임을 지지 않습니다.'] },
      { h: '9. 약관 변경', p: ['약관을 변경할 때는 앱 내 공지로 미리 안내합니다.'] },
      { h: '10. 준거법과 관할', p: ['이 약관은 일본 법률을 따릅니다. 분쟁이 생기면 운영자의 주소지를 관할하는 지방법원을 제1심의 전속적 합의 관할 법원으로 합니다.'] },
    ],
  },
  privacy: {
    title: '개인정보처리방침', updated: '2026년 11월 8일',
    sections: [
      { h: '1. 수집하는 정보', p: [
        '계정 정보: 이메일 주소, 계정 식별자(Google로 가입한 경우 Google 계정의 식별자).',
        '프로필: 이름, 사진, 자기소개, 음성 소개, 모국어와 학습 언어, 레벨, 취미, 대화 가능한 시간, 시차(기기 시계 설정). 프로필은 다른 이용자에게 표시됩니다.',
        '생년월일: 가입 시 기기에서 만 18세 이상인지 확인하는 데만 사용하며, 운영자의 서버에는 저장하지 않습니다.',
        '이용 정보: 통화 상대, 일시, 길이, 신뢰 점수, 팔로우, 차단, 통화 요청, 접속 상태(마지막 이용 시각).',
        '신고와 문의: 신고 사유와 대상, 문의 내용과 답변받을 이메일 주소.',
        '통화 음성은 상대에게 전달하기 위해 통화 사업자의 서버를 거치지만, 녹음하거나 저장하지 않습니다.',
        '푸시 알림용 토큰과 앱 표시 언어. 위치 정보, 연락처, 광고 식별자는 수집하지 않습니다.',
      ] },
      { h: '2. 이용 목적', p: ['상대 소개와 통화 제공, 부정 이용 방지와 신고 검토, 문의 대응, 서비스 개선을 위해 이용합니다.'] },
      { h: '3. 제3자 제공과 처리 위탁', p: [
        '법령에 따른 경우를 제외하고 본인의 동의 없이 제3자에게 제공하지 않습니다. 광고나 추적을 위해 정보를 제공하거나 이용하지 않습니다.',
        '서비스 제공에 필요한 범위에서 다음 사업자에게 처리를 위탁합니다. Google(Firebase: 인증, 데이터베이스, 파일 저장), LiveKit(음성 통화 중계), Expo(서버 운영, 앱 업데이트, 푸시 알림), Apple(iPhone 푸시 알림). 이 사업자들은 주로 미국 등의 서버에서 정보를 처리하며, 각 사의 기준에 따라 안전하게 관리합니다.',
      ] },
      { h: '4. 보관 기간과 삭제', p: ['계정을 삭제하면 프로필, 사진과 음성 소개, 기록, 팔로우, 신뢰 점수를 삭제합니다. 신고와 이용 정지 기록, 문의는 부정 방지와 대응에 필요한 기간 동안 보관하고, 필요 없어지면 삭제합니다. 계정 삭제는 앱의 “나” → “계정 삭제”에서 할 수 있습니다.'] },
      { h: '5. 열람·정정·삭제 요청과 문의', p: [`내 정보의 열람, 정정, 이용 정지, 삭제 요청이나 개인정보 처리에 관한 문의는 ${CONTACT}로 연락해 주세요. 본인 확인 후 지체 없이 처리합니다.`] },
      { h: '6. 운영자', p: [`${OPERATOR_EN}. 주소는 요청이 있으면 지체 없이 공개합니다.`] },
    ],
  },
  guidelines: {
    title: '커뮤니티 가이드라인', updated: '2026년 11월 8일',
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
        '필수 10분 이내에 스스로 끊음: 신뢰 점수 −10, 빠른 통화 30분 정지.',
        '위반이 확인됨: 신뢰 점수 −30. 성적인 내용이나 권유 등 중대한 위반은 7일간 이용 정지도 함께 적용되며, 반복하면 더 길게 정지됩니다.',
        '허위로 판단된 신고: 신뢰 점수 −10.',
      ] },
      { h: '곤란할 때는', p: ['통화 중 깃발 버튼으로 언제든 한 번에 신고하고 통화를 끝낼 수 있습니다. 한 번의 신고로 불이익을 받지는 않습니다.'] },
    ],
  },
  tokusho: {
    title: '특정상거래법에 따른 표기 (일본)', updated: '2026년 11월 8일',
    sections: [
      { h: '현재 판매', p: ['서비스는 무료이며 현재 판매하는 유료 상품은 없습니다. 유료 기능을 시작할 때 가격, 결제 방법, 해지·환불을 이 페이지에 게재합니다.'] },
      { h: '운영자', p: [OPERATOR_EN] },
      { h: '소재지·전화번호', p: ['요청이 있으면 지체 없이 공개합니다.'] },
      { h: '문의', p: [CONTACT] },
    ],
  },
  faq: {
    title: '자주 묻는 질문', updated: '',
    sections: [
      { h: '10분 전에 통화가 끊기면?', p: ['연결이 잠깐 끊기면 앱이 자동으로 다시 연결을 시도합니다. 연결 끊김으로 통화가 끝나도 불이익은 없습니다.'] },
      { h: '빠른 매칭은 모르는 사람과 바로 연결되나요?', p: ['아니요. 상대가 정해지면 먼저 이름, 사진, 언어, 자기소개가 보이고, “대화하기”나 “건너뛰기”를 고를 수 있어요. 둘 다 “대화하기”를 고를 때만 통화가 시작돼요. 대화한 상대는 “기록”에서 언제든 볼 수 있어요.'] },
      { h: '채팅할 수 있나요?', p: ['할 수 없습니다. 상대와 연결되는 방법은 10분 통화 요청뿐입니다.'] },
      { h: '팔로우는 어떻게 하나요?', p: ['10분 대화를 끝까지 한 상대만 팔로우할 수 있어요. 10분을 채운 뒤 상대 프로필에 팔로우 버튼이 나타나요. 좋아요나 댓글 기능은 없어요.'] },
      { h: '“연습 친구”와 “언어 교환”의 차이는?', p: ['연습 친구는 같은 언어를 배우고 모국어가 다른 사람과 그 언어로만 대화합니다. 언어 교환은 원어민과 두 언어를 반씩 사용합니다.'] },
      { h: '신뢰 점수가 다른 사람에게 보이나요?', p: ['숫자는 나만 볼 수 있습니다. 다른 사람에게는 “신뢰됨” 또는 “신규”로만 보입니다.'] },
    ],
  },
};

const es: Record<DocId, LegalDoc> = {
  terms: {
    title: 'Términos del servicio', updated: '8 de noviembre de 2026',
    sections: [
      { h: '1. Sobre el servicio', p: [`Tentalk (el “Servicio”) lo ofrece ${OPERATOR_EN} (el “Operador”) para practicar idiomas mediante llamadas de voz uno a uno.`] },
      { h: '2. Quién puede usarlo', p: ['Debes tener 18 años o más. Comprobamos tu fecha de nacimiento al registrarte y suspendemos las cuentas de menores de 18 años.'] },
      { h: '3. Tu cuenta', p: ['Te registras con un correo electrónico (o con una cuenta de Google en los dispositivos compatibles). La cuenta es solo para ti y no puede transferirse ni compartirse.'] },
      { h: '4. Normas de las llamadas', p: [
        'Las llamadas son uno a uno. Los primeros 10 minutos son obligatorios; después no hay límite de tiempo.',
        'Si cuelgas antes de 10 minutos, baja tu puntuación de confianza y las llamadas rápidas se pausan durante un tiempo. No cuenta si terminas por una denuncia, si se corta la conexión o si cuelga la otra persona.',
        'En una llamada rápida, antes de la llamada ves el nombre, la foto, los idiomas y la presentación de la otra persona, y la llamada empieza solo si los dos eligen hablar. Si alguno salta, no empieza ninguna llamada.',
      ] },
      { h: '5. Conductas prohibidas', p: ['Están prohibidas las conductas de las Normas de la comunidad, en especial los comentarios sexuales, los insultos o la discriminación, la captación, la publicidad o las estafas, los acercamientos románticos o para citas a usuarios con “Solo idiomas” y el uso por menores de 18 años. El Operador no tolera en absoluto el contenido inapropiado ni a los usuarios abusivos.'] },
      { h: '6. Denuncias y revisión', p: [
        'Puedes denunciar a la otra persona y terminar la llamada en cualquier momento, y también denunciar desde un perfil. La denuncia envía al Operador el motivo y datos como a quién se refiere y cuándo fue la llamada. El audio de las llamadas nunca se graba ni se envía.',
        'La persona denunciada queda bloqueada automáticamente y desaparece de tus pantallas y listas. Revisamos cada denuncia en 24 horas y, si se confirma una infracción, eliminamos el contenido inapropiado del perfil, bajamos la puntuación y suspendemos al usuario responsable. Las denuncias que se consideren falsas pueden conllevar medidas contra quien denuncia.',
      ] },
      { h: '7. Precio', p: ['El Servicio es gratuito. Antes de introducir funciones de pago, explicaremos en la app su contenido, precio y forma de pago, y actualizaremos estos términos.'] },
      { h: '8. Exención de responsabilidad', p: ['Salvo dolo o negligencia grave, el Operador no se responsabiliza de lo que los usuarios se dicen ni de los conflictos derivados de las llamadas.'] },
      { h: '9. Cambios', p: ['Anunciaremos con antelación en la app cualquier cambio de estos términos.'] },
      { h: '10. Ley aplicable', p: ['Estos términos se rigen por las leyes de Japón. El tribunal de distrito correspondiente al domicilio del Operador tendrá jurisdicción exclusiva en primera instancia.'] },
    ],
  },
  privacy: {
    title: 'Política de privacidad', updated: '8 de noviembre de 2026',
    sections: [
      { h: '1. Qué recopilamos', p: [
        'Cuenta: tu correo electrónico y el identificador de la cuenta (y el de tu cuenta de Google si te registraste con Google).',
        'Perfil: nombre, foto, “sobre ti”, presentación de voz, idioma nativo y los que aprendes, niveles, aficiones, horario disponible y diferencia horaria (según el reloj de tu dispositivo). Tu perfil se muestra a otros usuarios.',
        'Fecha de nacimiento: se comprueba en tu dispositivo al registrarte solo para confirmar que tienes 18 años o más; no se guarda en nuestros servidores.',
        'Uso: con quién hablas, fechas, duración, puntuación de confianza, seguidos, bloqueos, solicitudes de llamada y estado en línea (última vez que usaste la app).',
        'Denuncias y consultas: el motivo y la persona denunciada, y el contenido de las consultas con el correo de respuesta.',
        'El audio de las llamadas pasa por los servidores de nuestro proveedor de llamadas para llegar a la otra persona, pero nunca se graba ni se guarda.',
        'El token de notificaciones y el idioma de la app. No recopilamos ubicación, contactos ni identificadores publicitarios.',
      ] },
      { h: '2. Para qué lo usamos', p: ['Para presentarte compañeros y ofrecer las llamadas, evitar abusos y revisar denuncias, responder a tus consultas y mejorar el Servicio.'] },
      { h: '3. Con quién lo compartimos', p: [
        'No compartimos tu información con terceros sin tu consentimiento salvo que la ley lo exija. Nunca la compartimos ni usamos para publicidad o rastreo.',
        'Para el Servicio usamos estos proveedores: Google (Firebase: inicio de sesión, base de datos y archivos), LiveKit (transmisión de las llamadas de voz), Expo (servidores, actualizaciones de la app y notificaciones) y Apple (notificaciones en iPhone). Tratan los datos principalmente en servidores de Estados Unidos y otros países y los protegen según sus propias normas de seguridad.',
      ] },
      { h: '4. Conservación y eliminación', p: ['Al eliminar tu cuenta, borramos tu perfil, foto y presentación de voz, historial, seguidos y puntuación de confianza. Los registros de denuncias y suspensiones, y las consultas, se guardan el tiempo necesario para evitar abusos y responder, y se eliminan cuando dejan de ser necesarios. Puedes eliminar tu cuenta en la app desde Yo → Eliminar cuenta.'] },
      { h: '5. Tus derechos y contacto', p: [`Para acceder, corregir, dejar de usar o eliminar tu información, o para cualquier consulta sobre privacidad, escribe a ${CONTACT}. Responderemos sin demora tras confirmar tu identidad.`] },
      { h: '6. Operador', p: [`${OPERATOR_EN}. La dirección se facilita sin demora a quien la solicite.`] },
    ],
  },
  guidelines: {
    title: 'Normas de la comunidad', updated: '8 de noviembre de 2026',
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
        'Colgar antes de 10 minutos: puntuación de confianza −10 y sin llamadas rápidas durante 30 minutos.',
        'Infracción confirmada: puntuación −30. Las infracciones graves, como el contenido sexual o la captación, suponen además 7 días de suspensión, y más si se repiten.',
        'Denuncias consideradas falsas: puntuación −10.',
      ] },
      { h: 'Si algo va mal', p: ['Toca la bandera durante la llamada para denunciar y terminarla con un toque. Una sola denuncia nunca te penaliza.'] },
    ],
  },
  tokusho: {
    title: 'Aviso comercial (Japón)', updated: '8 de noviembre de 2026',
    sections: [
      { h: 'Ventas actuales', p: ['El Servicio es gratuito y por ahora no se vende nada. Cuando empiecen las funciones de pago, esta página indicará precios, forma de pago, cancelación y reembolsos.'] },
      { h: 'Operador', p: [OPERATOR_EN] },
      { h: 'Dirección y teléfono', p: ['Se facilitan sin demora a quien lo solicite.'] },
      { h: 'Contacto', p: [CONTACT] },
    ],
  },
  faq: {
    title: 'Preguntas frecuentes', updated: '',
    sections: [
      { h: '¿Y si la llamada se corta antes de 10 minutos?', p: ['Si la conexión se interrumpe un momento, la app intenta reconectarse sola. Una llamada que termina por un corte de conexión nunca cuenta en tu contra.'] },
      { h: '¿La llamada rápida me conecta de golpe con un desconocido?', p: ['No. Cuando se encuentra a alguien, primero ves su nombre, foto, idiomas y presentación, y eliges hablar o saltar. La llamada empieza solo cuando los dos eligen hablar. Las personas con las que hablaste siguen en el Historial.'] },
      { h: '¿Puedo chatear?', p: ['No. La única forma de contactar con alguien es pedir una llamada de 10 minutos.'] },
      { h: '¿Cómo sigo a alguien?', p: ['Solo puedes seguir a quienes completaron contigo una llamada de 10 minutos. Tras una llamada que llegó a 10 minutos, aparece el botón Seguir en su perfil. No hay «me gusta» ni comentarios.'] },
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
