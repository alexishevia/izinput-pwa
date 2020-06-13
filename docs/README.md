# Invoice Zero

Invoice Zero (IZ) is a personal finance system designed to be easy to use.

IZ is meant to answer the following questions:

1. How much money have I earned this month? How much money have I spent this month? How does that compare to previous months?
   Visit the `Trends` section to view your spending behavior over time.

The `Trends: Income vs Expenses` graph provides a monthly income vs expenses.

The `Trends: Expenses by Month` section includes one graph per category, showing how your spending behavior has evolved over time.

2. How much money do I currently have?
   At any time, you can visit the `Calculator` section and review your "available money".

Available money is calculated like this:

```
Initial savings + all INCOME transactions - all EXPENSE transactions
```

Your "initial savings" is the amount money you had before starting to use IZ.

3. How much money will I have in a year if my financial behavior does not change?
   The IZ `Calculator` calculates 3 values:

- Available money: how much money you have at this time.
- Income Rate: average monthly income, based on your historical data.
- Spending Rate: average monthly expenses, based on your historical data.

It then generates a graph showing you how your finances will look in the next 12 months.

4. If I lost my job today, how long will it take for my money to run out?
   The IZ `Calculator` lets you edit any of the 3 values: available money, income rate, and spending rate.
   It will update the graph in real-time to help you make predictions.

If you set the income rate to `0` (to simulate losing all your source of income), you can easily see how soon you'll reach `0` (or below).

## FAQ:

- Where is my data stored? Who will have access to my financial information?
  IZ is a stand alone app. Once the code is loaded, it can work completely offline.

  By default, all data is stored locally in your device, and is never shared with third parties.

  The entire application is open source, so anyone can inspect the code on Github.

- How can I sync data between my computer and my phone?
  You can enable sync on the `Settings` tab.

  At this moment, the only sync option available is through [Google Spreadsheets](./gdrive_sync.md), but other sync alternatives could be implemented if people request them.

  I specifically do not want to keep anyone's data on my servers, so any sync alternative would most likely be implemented using a third party service.

- Can I share my IZ account with another person (eg: my significant other, family member, etc) so we can collaborate on a shared budget?
  If you want to share a single IZ "account" with multiple people, just make sure everyone syncs their data to the same Google Spreadsheet.

  Google offers different methods to [share documents](https://support.google.com/docs/answer/2494822).

  Note: IZ has no real concept of "accounts", so it will treat any data that is sent to the Google Spreadsheet as if it was all coming from the same person.

- Can IZ be automatically populated from bank and credit card statements?
  Not at this moment.

  That being said, the technical docs on how to add data to IZ are [available here](./gdrive_sync.md).

  In theory, anyone could write a program that pulls data from a bank account and writes the transactions to the same Google Spreadsheet that IZ uses for syncing (given they have the right permissions to access the spreadsheet). However, it's not something I'm entirely sure I want to implement.

  I have tried using programs to parse my bank statements automatically, but with mixed results. Sometimes things wouldn't quite add up, and ended requiring manual inspection (for me it's usually cash purchases that throws accounts off balance). Or I wouldn't agree with how my bank categorized purchases, which required manual intervention. So I ultimately abandoned those systems.

  However, if you are interested in automating data input to IZ, please open a github issue explaining how you would like it to work, and I'll consider implementing it.

- How can I balance my budget?
  I do not use IZ as an accounting program, nor do I expect my IZ data to be 100% precise. IZ's main purpose is to motivate me to improve my spending behaviors. I can achieve that goal without having 100% precision, so I don't sweat any small issues that I may find in the data.

  I tried being extra thorough with my budget once, and ended up abandoning it because it was too much work. I'm trying to be more pragmatic this time. Hopefully, I'll still be using IZ in 3 years.

  I usually follow this approach for "balancing my budget":

  - As soon as I make a purchase, I jot it down in [IZInput](https://input.invoicezero.com). IZInput is a lightweight, mobile-friendly app that allows adding transactions to IZ in a quick and easy way.
  - Once a month I do a check on how much money I really have (bank account balance + any cash I have on hand - credit card balance). The result should match IZ's "available money".
  - If the values do not match:
    - When the difference is small, I just create a new transaction with the difference, and assign it to a category called "Unknown".
      This mostly represents small cash purchases that me or my wife sometimes forget to input.
      Keeping track of this "Unknown" category helps me see how accurately I'm adding my expenses to IZ (not to brag, but I feel I've been getting pretty good at it).
    - When the difference is considerable, I'll compare my IZ transactions against my bank statements, and try to find the root cause.
      This rarely happens to be honest, and is mostly a manual process.
      It's good that IZ keeps all my transaction history available for this purpose, but I tend to avoid going this route. If this problem becomes more common, I will consider adding tooling to improve the experience.

- How can I represent my debt in IZ (student loan, car loan, mortgage, etc)?
  IZ has no built-in concept of "debt". However, by keeping track of how much money you are paying to a loan, IZ reminds you of the cost of having that loan active.

  I do the following with my car loan:
  Every month I make a payment to my car loan, and then I input the transaction into IZ, under a category I call "Transportation".

  When I look at my trends, I can see I'm putting in a lot of money into "Transportation" every month. This reminds me that I have a car loan active, and makes me think about possible solutions to close it.
