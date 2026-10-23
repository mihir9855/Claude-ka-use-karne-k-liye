from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, ListFlowable, ListItem)

NAVY = colors.HexColor("#12284c")
TEAL = colors.HexColor("#0f9d8a")
LIGHT = colors.HexColor("#eef3f8")
GREY = colors.HexColor("#555b66")

title = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=28, leading=34, textColor=NAVY)
sub = ParagraphStyle("s", fontName="Helvetica", fontSize=13, leading=18, textColor=GREY)
h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=NAVY,
                    spaceBefore=14, spaceAfter=6)
body = ParagraphStyle("b", fontName="Helvetica", fontSize=10.5, leading=15, textColor=colors.HexColor("#222"))
cell = ParagraphStyle("c", parent=body, fontSize=9.5, leading=13)
cellb = ParagraphStyle("cb", parent=cell, fontName="Helvetica-Bold", textColor=colors.white)
note = ParagraphStyle("n", parent=body, textColor=colors.HexColor("#7a4b00"))


def bullets(items):
    return ListFlowable([ListItem(Paragraph(i, body), leftIndent=12) for i in items],
                        bulletType="bullet", bulletColor=TEAL, leftIndent=14)


def table(rows, widths, header=True):
    data = [[Paragraph(c, cellb if (header and r == 0) else cell) for c in row]
            for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#c9d3df")),
          ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]
    if header:
        st += [("BACKGROUND", (0, 0), (-1, 0), NAVY),
               ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT])]
    t.setStyle(TableStyle(st))
    return t


def footer(c, d):
    c.saveState()
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY)
    c.drawString(20 * mm, 10 * mm, "Stock Chart Scanner - Project Plan")
    c.drawRightString(A4[0] - 20 * mm, 10 * mm, f"Page {d.page}")
    c.restoreState()


def first(c, d):
    c.saveState()
    c.setFillColor(NAVY)
    c.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.rect(0, A4[1] - 14 * mm, A4[0], 2 * mm, fill=1, stroke=0)
    c.restoreState()
    footer(c, d)


W = A4[0] - 40 * mm
s = []
s += [Spacer(1, 14 * mm), Paragraph("Stock Chart Scanner", title),
      Paragraph("Fundamental + Technical Analysis with Quarterly Results", sub), Spacer(1, 8 * mm)]

s += [Paragraph("What the app does", h1),
      bullets(["Pick a stock universe (e.g. Nifty 500 or S&amp;P 500).",
               "Pull price data and quarterly financials for each stock.",
               "Score every stock on <b>Technical</b> and <b>Fundamental</b> factors.",
               "Combine into one score and show a ranked table with a chart per stock.",
               "Each quarter, after results are declared, refresh fundamentals and re-rank."])]

s += [Paragraph("Data sources (free to start)", h1),
      table([["Need", "Source"],
             ["Daily prices (OHLCV)", "yfinance (NSE symbols end in .NS, BSE in .BO)"],
             ["Quarterly results (sales, profit, EPS)", "yfinance quarterly financials, or Screener.in / NSE exports"],
             ["Ratios (P/E, ROE, debt/equity)", "yfinance info, or Screener.in"],
             ["Paid, more reliable option", "Fyers, Zerodha Kite API, or Alpha Vantage"]],
            [W * 0.4, W * 0.6])]

s += [Paragraph("Scoring logic", h1),
      table([["Technical (price chart)", "Fundamental (quarterly-based)"],
             ["<b>Trend:</b> price above 50- and 200-day MA; golden cross (50 above 200)",
              "<b>Growth:</b> sales growth YoY and QoQ"],
             ["<b>Momentum:</b> RSI between 50 and 70; MACD bullish crossover",
              "<b>Profit:</b> net profit and EPS growth YoY"],
             ["<b>Breakout:</b> near 52-week high with volume above 20-day average",
              "<b>Margins:</b> operating margin trend"],
             ["<b>Volatility:</b> ATR or Bollinger Band squeeze",
              "<b>Health:</b> ROE, debt/equity, P/E vs sector average"]],
            [W * 0.5, W * 0.5]),
      Spacer(1, 4 * mm),
      Paragraph("Each factor is scored 0-100. <b>Final score = 0.5 x Technical + 0.5 x Fundamental</b> "
                "(weights adjustable). Labels: Strong Buy, Watch, Neutral, Avoid.", body)]

s += [PageBreak(), Paragraph("Quarterly view", h1),
      bullets(["Stores each stock's last 4-8 quarters of results.",
               "Shows QoQ and YoY growth with a <b>result beat / miss</b> flag.",
               "Lists stocks whose results were just declared, with the price reaction.",
               "Keeps score history to show which stocks improved this quarter."])]

s += [Paragraph("Tech stack", h1),
      table([["Layer", "Choice"],
             ["Backend", "Python (pandas, ta / pandas-ta, yfinance)"],
             ["Storage", "SQLite, so data is not re-fetched on every run"],
             ["App", "Streamlit (fastest to build, works in mobile browser) + Plotly candlestick charts"],
             ["Scheduling", "Daily price refresh; quarterly fundamentals refresh"]],
            [W * 0.25, W * 0.75])]

s += [Paragraph("Build phases", h1),
      table([["Phase", "Deliverable"],
             ["1. MVP", "Scanner for one watchlist: technical indicators, fundamentals table, combined score"],
             ["2. Charts", "Candlestick with MA, RSI, MACD; filters (score, sector, market cap)"],
             ["3. Quarterly module", "Results history, growth trends, result-day reaction"],
             ["4. Extras", "Alerts (Telegram / email), backtest of the scoring rule, CSV export"]],
            [W * 0.25, W * 0.75])]

s += [Paragraph("Caveats", h1),
      bullets(["Free data can be delayed or have gaps; verify anything you plan to act on.",
               "This is a screening tool, not investment advice. A high score does not guarantee returns."])]

s += [Paragraph("Decisions needed before building", h1),
      table([["Question", "Options"],
             ["1. Which market?", "NSE/BSE (India), US, or both"],
             ["2. Which format?", "Streamlit web app (recommended), mobile app, or desktop app"],
             ["3. Which universe?", "Nifty 50, Nifty 500, or your own watchlist"]],
            [W * 0.3, W * 0.7])]

doc = SimpleDocTemplate("/home/user/Claude-ka-use-karne-k-liye/docs/stock-chart-scanner-plan.pdf",
                        pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                        topMargin=20 * mm, bottomMargin=18 * mm,
                        title="Stock Chart Scanner - Project Plan")
doc.build(s, onFirstPage=first, onLaterPages=footer)
