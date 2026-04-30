# Mundi Content Vocabulary

The single source of truth for terms, button labels, microcopy, and empty-state copy in Mundi designs. Use these exact strings — do not invent synonyms, do not translate the Turkish-primary strings to English unless the design is explicitly English.

---

## Locales

| Locale  | Use                                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `tr-TR` | **Primary.** Section names and most user-facing flow labels.                                                                        |
| `en-US` | Secondary. Internal English mirror. Use when designing for English-locale screenshots or when the user explicitly requests English. |

When in doubt, deliver `tr-TR` and note the `en-US` equivalent in a side comment.

---

## Domain Vocabulary

These are the canonical nouns. Never substitute synonyms.

| Concept                        | en-US                    | tr-TR                         |
| ------------------------------ | ------------------------ | ----------------------------- |
| Account total cash             | `Balance`                | `Bakiye`                      |
| Uninvested portion             | `Idle cash`              | `Atıl nakit`                  |
| Total earnings                 | `Yield` / `Return`       | `Getiri`                      |
| Daily earnings                 | `Daily yield`            | `Günlük getiri`               |
| Single investment holding      | `Position`               | `Pozisyon`                    |
| Distribution of funds          | `Allocation`             | `Dağılım`                     |
| Money movement (any direction) | `Transfer`               | `Aktarım`                     |
| Money in                       | `Deposit`                | `Yatırım` (or `Para Yatırma`) |
| Money out                      | `Withdrawal`             | `Çekim` (or `Para Çekme`)     |
| Inter-account move             | `Inter-account transfer` | `Hesap arası aktarım`         |
| Outgoing to bank               | `Outbound transfer`      | `Bankaya aktar`               |
| Incoming from bank             | `Inbound transfer`       | `Banakadan aktar`             |
| Buy fund                       | `Buy funds`              | `Fon al`                      |
| Sell fund                      | `Sell funds`             | `Fon sat`                     |
| Period summary                 | `Statement`              | `Hesap özeti`                 |
| Risk tier                      | `Risk profile`           | `Risk profili`                |
| Counterparty (bank)            | `Institution` / `Bank`   | `Kurum` / `Banka`             |
| Recipient (transfer target)    | `Recipient`              | `Alıcı`                       |
| Linked external bank account   | `Linked account`         | `Bağlı hesap`                 |
| Investment account at broker   | `Investment account`     | `Yatırım hesabı`              |

---

## Risk Profile Tiers

| en-US          | tr-TR       |
| -------------- | ----------- |
| `Conservative` | `İhtiyatlı` |
| `Balanced`     | `Dengeli`   |
| `Aggressive`   | `Atılgan`   |

---

## Status Vocabulary

Use these as `badge` text.

| State                    | en-US               | tr-TR           | Context   |
| ------------------------ | ------------------- | --------------- | --------- |
| In flight                | `Pending`           | `Bekliyor`      | `warning` |
| Done successfully        | `Completed`         | `Tamamlandı`    | `success` |
| Failed                   | `Failed`            | `Başarısız`     | `danger`  |
| Cancelled by user        | `Cancelled`         | `İptal edildi`  | `neutral` |
| Awaiting approval        | `Awaiting approval` | `Onay bekliyor` | `warning` |
| Approved                 | `Approved`          | `Onaylandı`     | `success` |
| Rejected                 | `Rejected`          | `Reddedildi`    | `danger`  |
| Verification in progress | `Verifying`         | `Doğrulanıyor`  | `info`    |
| Verified                 | `Verified`          | `Doğrulandı`    | `success` |
| Live position            | `Active`            | `Aktif`         | `success` |
| Dormant / closed         | `Inactive`          | `Pasif`         | `neutral` |

---

## Primary Action Verbs (Buttons)

Use these exact strings on `button-solid` primary actions.

| en-US               | tr-TR               | Context                               |
| ------------------- | ------------------- | ------------------------------------- |
| `New transfer`      | `Yeni aktarım`      | Top-level transfer entry              |
| `Outbound transfer` | `Bankaya aktar`     | Send to bank                          |
| `Inbound transfer`  | `Banakadan aktar`   | Pull from bank                        |
| `Deposit`           | `Para yatır`        | Add cash                              |
| `Withdraw`          | `Para çek`          | Pull out cash                         |
| `Buy funds`         | `Fon al`            | Investment buy                        |
| `Sell funds`        | `Fon sat`           | Investment sell                       |
| `Invest`            | `Yatırım yap`       | Generic invest action                 |
| `Redeem`            | `Bozdur`            | Liquidate position                    |
| `Connect bank`      | `Banka bağla`       | Link bank account                     |
| `Open account`      | `Hesap aç`          | Open investment account               |
| `View statement`    | `Hesap özetini gör` | Open statement                        |
| `Download report`   | `Rapor indir`       | Export report                         |
| `Confirm transfer`  | `Aktarımı onayla`   | Step-2 review action                  |
| `Cancel transfer`   | `Aktarımı iptal et` | Destructive (`button-outline danger`) |

**Rule:** Step-progression buttons use the **next-step domain verb**, not generic `Continue` / `Next`:

| Step                  | en-US              | tr-TR             |
| --------------------- | ------------------ | ----------------- |
| Form → Review         | `Review transfer`  | `Aktarımı incele` |
| Review → Confirmation | `Confirm transfer` | `Aktarımı onayla` |
| Confirmation → Done   | `Done`             | `Tamam`           |

---

## Secondary / Tertiary Actions

| en-US               | tr-TR               | Variant                                     |
| ------------------- | ------------------- | ------------------------------------------- |
| `Cancel`            | `Vazgeç`            | `button-link`                               |
| `Back`              | `Geri`              | `button-link` (or `Page Title` Back Button) |
| `Edit`              | `Düzenle`           | `button-link`                               |
| `Remove`            | `Kaldır`            | `button-link danger`                        |
| `Add recipient`     | `Alıcı ekle`        | `button-smooth`                             |
| `Manage recipients` | `Alıcıları yönet`   | `button-link`                               |
| `See all`           | `Tümünü gör`        | `button-link`                               |
| `Show more`         | `Daha fazla göster` | `button-link`                               |

---

## Microcopy Patterns

### Empty States

| Surface          | en-US                                                        | tr-TR                                                     |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| No recipients    | `No recipients yet — add your first one to send money fast.` | `Henüz alıcı yok — hızlı gönderim için ilk alıcını ekle.` |
| No positions     | `You don't have any positions yet.`                          | `Henüz pozisyonun yok.`                                   |
| No transactions  | `No transactions yet.`                                       | `Henüz işlem yok.`                                        |
| No notifications | `You're all caught up.`                                      | `Tüm bildirimleri gördün.`                                |

Pair with a `card` containing illustration + title + body + primary action.

### Helper Text

| Surface         | en-US                                             | tr-TR                                         |
| --------------- | ------------------------------------------------- | --------------------------------------------- |
| Amount field    | `Available balance: ₺{amount}`                    | `Kullanılabilir bakiye: ₺{amount}`            |
| Recipient field | `Search by name or IBAN`                          | `Ad veya IBAN ile ara`                        |
| Note field      | `Optional — appears on the recipient's statement` | `İsteğe bağlı — alıcının ekstresinde görünür` |

### Validation Messages

| Surface              | en-US                                    | tr-TR                                   |
| -------------------- | ---------------------------------------- | --------------------------------------- |
| Insufficient balance | `Amount exceeds your available balance.` | `Tutar kullanılabilir bakiyeyi aşıyor.` |
| IBAN invalid         | `This IBAN is not valid.`                | `Bu IBAN geçerli değil.`                |
| Required field       | `This field is required.`                | `Bu alan zorunlu.`                      |
| Min amount           | `Minimum amount is ₺{n}.`                | `En düşük tutar ₺{n}.`                  |
| Max amount           | `Daily limit is ₺{n}.`                   | `Günlük limit ₺{n}.`                    |

### Confirmation / Receipts

| Surface                 | en-US                                           | tr-TR                                            |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------ |
| Transfer success title  | `Transfer sent`                                 | `Aktarım gönderildi`                             |
| Transfer success body   | `₺{amount} sent to {recipient}.`                | `₺{amount} {recipient} kişisine gönderildi.`     |
| Transfer success action | `Done`                                          | `Tamam`                                          |
| Deposit pending title   | `Deposit pending`                               | `Yatırım bekliyor`                               |
| Deposit pending body    | `Your deposit will be available within {time}.` | `Yatırımın {time} içinde kullanılabilir olacak.` |

### Processing Delay (Alert Screen)

Used when a backend operation exceeds 2s. Render as a separate page frame with `Alert Screen`.

| Field | en-US                                                               | tr-TR                                               |
| ----- | ------------------------------------------------------------------- | --------------------------------------------------- |
| Title | `Just a moment…`                                                    | `Bir saniye…`                                       |
| Body  | `We're processing your transfer. This usually takes a few seconds.` | `Aktarımın işleniyor. Genelde birkaç saniye sürer.` |

### Destructive Confirmation (Modal Screen)

| Field   | en-US                                                                       | tr-TR                                                             |
| ------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Title   | `Cancel transfer?`                                                          | `Aktarım iptal edilsin mi?`                                       |
| Body    | `This will stop the transfer to {recipient}. This action cannot be undone.` | `Bu işlem {recipient} kişisine aktarımı durdurur. Geri alınamaz.` |
| Confirm | `Cancel transfer` (`button-outline danger`)                                 | `Aktarımı iptal et`                                               |
| Dismiss | `Keep transfer` (`button-link`)                                             | `Aktarımı sürdür`                                                 |

---

## Number, Currency, Date Formatting

| Type                  | Format (tr-TR)                             | Format (en-US)          | Example                                  |
| --------------------- | ------------------------------------------ | ----------------------- | ---------------------------------------- |
| Currency              | `₺` prefix, `1.234.567,89`                 | `₺1,234,567.89`         | `₺245.123,45`                            |
| Percentage            | `0,00%`                                    | `0.00%`                 | `4,75%`                                  |
| Yield delta           | `+₺245,12` (success) / `−₺123,45` (danger) | `+₺245.12` / `−₺123.45` | render as `success` / `danger` text only |
| Date                  | `28 Nis 2026`                              | `Apr 28, 2026`          | short month abbreviation                 |
| Date + time           | `28 Nis 2026, 14:32`                       | `Apr 28, 2026, 2:32 PM` | 24h in tr-TR, 12h in en-US               |
| Account number masked | `**** 1234`                                | `**** 1234`             | last 4 digits only                       |
| IBAN masked           | `TR** **** **** **** **** **34`            | same                    | first 2 + last 2 visible                 |

---

## Forbidden Synonyms

These appear as common LLM defaults — do not use them in Mundi.

| ❌ Don't use            | ✅ Use instead                                                         |
| ----------------------- | ---------------------------------------------------------------------- |
| `Profit`                | `Yield` / `Return`                                                     |
| `Loss`                  | `Negative return` (or use the `−` delta in `danger`)                   |
| `Asset` (for a holding) | `Position`                                                             |
| `Holding`               | `Position`                                                             |
| `Send Money`            | `Outbound transfer`                                                    |
| `Top up`                | `Deposit`                                                              |
| `Cash out`              | `Withdraw`                                                             |
| `Submit`                | the domain verb (`Transfer`, `Confirm transfer`, `Save recipient`)     |
| `OK`                    | the domain verb or `Done` / `Got it`                                   |
| `Continue` / `Next`     | the next-step domain verb (`Review transfer`, `Confirm transfer`)      |
| `Account` (ambiguous)   | `Investment account` / `Linked account` / `Bank account` — be specific |
| `Money` (in body copy)  | `Cash` / `Balance` / `Funds` depending on context                      |
