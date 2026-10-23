#!/usr/bin/env python3
"""Position size: python3 position_size.py ACCOUNT ENTRY STOP [RISK_PCT=1] [RR=2]"""
import sys

def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    account, entry, stop = (float(x) for x in sys.argv[1:4])
    risk_pct = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
    rr = float(sys.argv[5]) if len(sys.argv) > 5 else 2.0
    if entry == stop:
        sys.exit("Entry aur stop same nahi ho sakte")
    risk_amt = account * risk_pct / 100
    dist = abs(entry - stop)
    units = risk_amt / dist
    side = 1 if entry > stop else -1
    target = entry + side * dist * rr
    print(f"Risk amount : {account} x {risk_pct}% = {risk_amt:.2f}")
    print(f"Stop dist   : |{entry} - {stop}| = {dist:.4f}")
    print(f"Size        : {risk_amt:.2f} / {dist:.4f} = {units:.4f} units")
    print(f"Position val: {units * entry:.2f}")
    print(f"{rr:g}R target  : {target:.4f}")
    if rr < 2:
        print("WARNING: R:R 1:2 se kam hai — rules ke hisab se skip.")

main()
