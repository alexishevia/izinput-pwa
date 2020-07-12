# Invoice Zero

Invoice Zero (IZ) is a personal finance system designed to be easy to use.

IZ is based on just two concepts: Accounts and Transfers.

Every transaction in IZ is represented as a Transfer between two Accounts.

Eg:

- You finish a gig and get paid \$500.

  This can be represented as a \$500 transfer from your "Gigs" account to your "Savings" account.

- You order take out and spend \$30.

  This can be represented as a \$30 transfer from your "Savings" account to your "Food" account.

- You want to save \$50 towards buying a new TV.

  This can be represented as a \$50 transfer from your "Savings" account to your "TV Savings" account.

In these examples:  
"Gigs" and "Food" would be "external" accounts (money that is not yours).  
"Savings" and "TV Savings" would be "internal" accounts (your money).

That's it. You decide how many accounts you want to create and how you want to name them.

Based on the transfers you record, IZ can help you answer questions like:

- How much money have I earned this month?
- How much money have I spent this month?
- How much money do I currently have?
- How does my spending patterns compare to previous months?
- How much money will I have in a year if my financial behavior does not change?
- If I lost my income sources today, how long will it take for my money to run out?

## FAQ:

- Where is my data stored? Who will have access to my financial information?

  IZ is a stand alone app. Once the code is loaded, it can work completely offline.

  By default, all data is stored locally in your device, and is never shared with third parties.

  The entire application is open source, so anyone can inspect the code on Github.

- How can I sync data between my computer and my phone?

  You can enable sync on the `Settings` tab.

  At this moment, the only sync option available is through [Google Spreadsheets](./gdrive_sync.md), but other sync alternatives could be implemented if people request them.

- Can I share my IZ account with another person (eg: my significant other, family member, etc) so we can collaborate on a shared budget?

  If you want to share an IZ "account" with multiple people, just make sure everyone syncs their data to the same Google Spreadsheet.

  Google offers different methods to [share documents](https://support.google.com/docs/answer/2494822).

  Note: IZ has no real concept of "per-user accounts", so it will treat any data that is sent to the Google Spreadsheet as if it was all coming from the same person.

- Can IZ be automatically populated from bank and credit card statements?

  Not at this moment.

  That being said, the technical docs on how to add data to IZ are [available here](./gdrive_sync.md).

  In theory, anyone could write a program that pulls data from a bank account and writes the transactions to the same Google Spreadsheet that IZ uses for syncing (given they have the right permissions to access the spreadsheet).

  Automatically populating data is not currently on my plans.
