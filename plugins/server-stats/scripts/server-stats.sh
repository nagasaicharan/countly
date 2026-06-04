#!/bin/bash

usage (){
    echo "userovo server-stats usage:";
    echo ""
    echo "Available commands: 'dp', 'top', 'hourly'"
    echo ""
    echo "userovo server-stats dp              # dp for current month"
    echo "userovo server-stats dp 2021-3       # dp for specific month"
    echo "userovo server-stats dp 3_months     # dp for 3, 6 or 12 months"
    echo "userovo server-stats top             # top apps with dp in current hour"
    echo "userovo server-stats hourly          # punch card with hourly data max dp"
    echo "userovo server-stats hourly avg      # punch card with hourly data for specific metric, min, max, sum or avg"
}
usage;