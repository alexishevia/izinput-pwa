# Invoice Zero

Invoice Zero (IZ) is a personal finance system designed to be easy to use.

IZ supports three types of transactions:

- Income: money is deposited to one of your accounts
- Expense: money is withdrawn from one of your accounts
- Transfer: money is exchanged between two accounts

IZ allows you to assign a category to every transaction, so you can keep track of where your money is being spent (or earned).

Based on the transactions you record, IZ can help you answer questions like:

- How much money have I earned this month?
- How much money have I spent this month?
- How much money do I currently have on each account?
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

  If you want to share IZ data with multiple people, just make sure everyone syncs their apps to the same Google Spreadsheet.

  Google offers different methods to [share documents](https://support.google.com/docs/answer/2494822).

  Note: IZ has no real concept of "per-user accounts", so it will treat any data that is sent to the Google Spreadsheet as if it was all coming from the same person.

- Can IZ be automatically populated from bank and credit card statements?

  Not at this moment.

  That being said, the technical docs on how to add data to IZ are [available here](./gdrive_sync.md).

  In theory, anyone could write a program that pulls data from a bank account and writes the transactions to the same Google Spreadsheet that IZ uses for syncing (given they have the right permissions to access the spreadsheet).

  Automatically populating data is not currently on my plans.
