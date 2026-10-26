# Tentalk

1対1の10分通話で話せるようになる語学アプリ。Expo（React Native）で iOS / Android / Web を1つのコードから作ります。

仕様の元になったプロトタイプ: https://claude.ai/artifact/4fE77yRVQ8f4JPQ4ZP5qhp

## いまの状態（マイルストーン2まで）

動くもの:

- 初回の流れ: サインイン（Google / メールとパスワード。Firebase Authentication）→ 生年月日（18歳未満は不可）→ 言語 → レベル（5段階）→ プロフィール（アイコン・名前）→ 使い方ガイド → ホーム
- 表示言語: 端末の言語で開始（日本語・英語・韓国語・スペイン語、それ以外は英語）。「自分」で変更でき、再起動後も保持
- ホーム: ピップのひとこと、学習言語とモードの切り替え、ランダム通話ボタン、今週の進み具合、フォロー中の人、おすすめの相手
- 探す: 言語交換 / 練習仲間 / 共通の趣味の3区分、レベル別のオンライン人数と絞り込み、並び替え（オンライン優先・共通の趣味・レベルが近い）。通話中とブロックした人は出ない
- プロフィール: 自己紹介、言語とレベル、話せる時間帯（相手の時間に換算）、現地時刻、趣味（共通は強調）、フォロー、ブロック、10分通話のリクエスト
- リクエスト通話: オンラインの相手は返事を待って即通話（60秒で自動取り消し）。オフラインの相手は24時間有効で、承認されると通知から通話できる
- ランダム通話: 10分の必修 → 延長 → 結果。言語の切り替え、交代の合図、トピック、お助けフレーズ、沈黙時の提案、途中退出の確認とペナルティ、理由付きの通報、10分完走でのプロフィール公開とフォロー、お祝いとバッジ
- 通知: ようこそ、今週のテーマ、リクエストの承認と着信（期限付きのボタン）。未読数をタブに表示
- 履歴: すべての通話。ランダムの相手は10分完走したときだけ名前とプロフィールが見える
- 自分: プロフィールの編集（アイコン・写真・名前・自己紹介・自己紹介の音声15秒・母語・学習言語2つまで・趣味・時間帯・Plusのフレーム）、信頼スコア、バッジ、通話の設定、ブロックした人の解除、表示言語、ログアウト
- 規約とサポート: 利用規約、プライバシーポリシー、コミュニティガイドライン、特定商取引法に基づく表記、よくある質問、ライセンス、お問い合わせ、アプリ内のアカウント削除（規約類は下書き。公開前に専門家の確認が必要）
- Tentalk Plus: 購入画面（月額・年額、自動更新の説明、購入の復元）、広告なし、アイコンのフレーム。広告は4回目以降、2回の通話ごとに結果画面へ静止画カード
- 10分以内に自分から切ると、ランダム通話が30分止まる（ホームで理由を表示）

まだ仮のもの（差し替え前提でインターフェースを分けてあります）:

| 部分 | いま | 本番 |
|---|---|---|
| サインイン | Firebase Authentication。メールとパスワードは全端末、Google は Web と Android（`google-services.json` を入れたビルドのみ。`src/services/firebase/google.ts`） | iPhone の Google と Apple（Apple Developer Program が必要） |
| 相手と相手探し | `src/data/samplePartners.ts` のサンプル、`src/services/matchmaking.ts` | サーバーの言語ペアごとの待機列とプロフィール |
| リクエスト | `src/services/requests.ts`（オンラインは2.5秒後、オフラインは6秒後に承認） | サーバーとプッシュ通知 |
| 通話の音声 | つながない（画面と時間だけ） | WebRTC（LiveKit などの通話サービス） |
| 沈黙の検出 | 開発用ボタンで再現 | 端末内の発話検出 |
| 購入 | `src/services/purchases.ts`（押すと加入状態になる） | App Store / Google Play のアプリ内課金 |
| 広告 | サンプルのカード | 広告配信サービス（導入時にプライバシーポリシーへ追記） |
| お問い合わせ・アカウント削除 | `src/services/support.ts`（送信したことにする） | サーバー |
| データの保存 | Firestore にプロフィール、設定、フォロー、ブロック、履歴、信頼スコア（`src/state/cloudShape.ts`、ルールは `firestore.rules`）。写真と自己紹介の音声は Storage（`src/services/media.ts`、ルールは `storage.rules`）。通知は端末の中だけ | 通知はサーバー、信頼スコアはサーバーで計算 |

## 動かし方

```bash
npm install
npm run web        # ブラウザで確認（いちばん手軽）
npm start          # Expo Go / 開発ビルドで実機確認（QRコードを読む）
```

開発中は通話画面に「30倍速」ボタンと沈黙の再現ボタンが出ます（本番ビルドでは非表示）。

チェック:

```bash
npm run typecheck  # 型チェック
npm run lint       # ESLint
npm test           # ロジックと翻訳ファイルのテスト
```

## フォルダ構成

```
src/
  app/            画面（Expo Router。ファイル＝画面）
    (onboarding)/ 初回の流れ
    (tabs)/       下部タブの5画面
    call.tsx      通話画面
  domain/         画面に依存しないルール（テストあり）
    callRules.ts  10分ルール、ペナルティ、信頼スコア、広告の出し方
    matching.ts   練習仲間 / 言語交換の判定と相手の絞り込み
    validation.ts メール、コード、年齢、言語の検証
  i18n/           翻訳（locales/ja.ts を基準に、en / ko / es が同じキーを持つことをテストで確認）
  services/       外部とつながる部分（いまはモック）
  state/          アプリの状態（zustand。端末に保存）
  data/           トピック、お助けフレーズ、サンプルの相手
  components/     共通の部品
  theme/          色（ライト / ダーク）
```

文言を追加するときは `src/i18n/locales/ja.ts` にキーを足し、他の3言語にも同じキーを足します（足りないと型エラーとテスト失敗で分かります）。

## デザインの決定事項

| 項目 | 決定 |
|---|---|
| キャラクター | Pip（ピップ）。吹き出しに顔と腕、頭に音の波。`src/components/Pip.tsx` |
| キャラクターの色 | モードに連動（学習言語＝青、練習仲間＝緑、母語＝赤） |
| 配色 | 落ち着いた青・赤・緑。`src/theme/colors.ts`（ライト / ダーク） |
| 文字 | 端末標準（iPhone はヒラギノ、Android は Noto Sans）。4言語で同じ品質を保つため |
| アプリアイコン | Pip の顔（`assets/icon.png`、Android は前景・背景・単色の3枚） |
| Pip が出る場面 | ホームのひとこと、相手探し、通話中の話題提案、通話後のお祝い、ようこそ画面、使い方ガイド |
| 定着の仕組み | 連続日数、週3回の目標、バッジ8種。10分話しきった通話だけを数える（`src/domain/progress.ts`） |

候補の比較ページ: https://claude.ai/artifact/D76p6isuwx2JLpZ3Qyr7YL

## Firebase

プロジェクト `tentalk-c6061`（Blaze プラン）。設定値は `src/services/firebase/config.ts`。

| サービス | 設定 |
|---|---|
| Authentication | メール/パスワード、Google |
| Firestore | `asia-northeast1`、ルールは `firestore.rules`（コンソールに貼り付けて公開） |
| Storage | `US-WEST1`（無料枠）、ルールは `storage.rules`（同上） |

ルールを変えたら、リポジトリのファイルとコンソールの両方を更新します。

## EAS（ビルドと Web の公開）

設定は `eas.json`（ビルドの種類）と `app.config.js`（`app.json` に Google ログインを足す）。アプリの ID は iOS / Android とも `com.tentalk.app`（ストアに出したあとは変えられません）。

| 種類 | 使いみち | コマンド |
|---|---|---|
| development | 開発用（`npm start` の画面をスマホで開く。Expo Go の代わり） | `npx eas-cli@latest build --profile development --platform android` |
| preview | テスト版の .apk（そのまま端末に入れられる） | `npx eas-cli@latest build --profile preview --platform android` |
| production | ストア提出用（.aab） | `npx eas-cli@latest build --profile production --platform android` |
| Web | EAS Hosting に公開（本番: https://tentalk.expo.app ） | `npm run deploy:web`（本番の URL にするときは `npx eas-cli@latest deploy --prod`） |

最初の1回だけ:

1. https://expo.dev/signup でアカウントを作り、`npx eas-cli@latest login`
2. `npx eas-cli@latest init` でプロジェクトを作る（`app.json` に `extra.eas.projectId` と `owner` が入るのでコミットする）
3. Android の最初のビルドで署名の鍵を EAS に作らせる（質問に Yes）。できた鍵の SHA-1 は `npx eas-cli@latest credentials -p android` で見られる
4. Web を公開したら、その URL（`〜.expo.app`）を Firebase コンソールの Authentication → 設定 → 承認済みドメインに足す（足さないと Web の Google ログインが失敗する）

Android の Google ログイン:

1. Firebase コンソール → プロジェクトの設定 → アプリを追加 → Android。パッケージ名は `com.tentalk.app`、SHA-1 は上の手順3の値（Play で配るときは Play Console のアプリ署名鍵の SHA-1 も足す）
2. ダウンロードした `google-services.json` をリポジトリの直下に置いてコミットする（秘密の値は入っていない）
3. ビルドし直す。ファイルがあるときだけ Google ログインのプラグインが入り、ボタンが出る。Expo Go ではボタンは出ない

## 次のマイルストーン

3. Firebase の導入: サインイン、アカウント削除、Firestore と Storage への保存（済）
4. 通話サービスの導入: 本物の音声通話、マッチングサーバー、通報の受付と管理画面
5. 通知（リクエスト、通話タイム）、Tentalk Plus（アプリ内課金）と広告
6. ストア申請の準備: 規約類、プライバシーの記載、スクリーンショット、TestFlight / 内部テスト

次の作業: 上の「EAS」の最初の1回をやる（アカウント作成、`eas init`、`google-services.json`）→ Web の公開と Android のテスト版（preview）で動作確認。コード側の準備（`eas.json`、開発ビルド、Android の Google ログイン）は済み。その後マイルストーン4へ。

本番に向けて必要になるもの: Apple Developer Program（年額）、Google Play デベロッパー登録、Firebase プロジェクト、通話サービスのアカウント、EAS（Expo のビルドサービス）のアカウント。
