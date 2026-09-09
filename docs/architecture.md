# SalarySplit — System Architecture & Data Model

`SalarySplit` (*"Give every rupee a job"*) is a full-stack personal salary allocation dashboard that enforces the 35/25/10/15/15 rule with custom rule flexibility, goal tracking, and actual spending comparisons.

---

## 1. High-Level Architecture Diagram

```text
               +-----------------------------+
               |        React Frontend       |
               | (Vite + Tailwind + Recharts)|
               +--------------+--------------+
                              |
                     REST API / JSON
                              |
               +--------------v--------------+
               |     Node + Express Backend  |
               | (Auth, Calculation Engine,  |
               |  Security Headers & Limits) |
               +--------------+--------------+
                              |
                      SQL / WAL Mode
                              |
               +--------------v--------------+
               |     PostgreSQL / SQLite     |
               |          Database           |
               +-----------------------------+
```

---

## 2. Core Rule Engine Formulas

The central allocation rule formula converts any monthly salary amount \( S \) into 5 distinct financial buckets:

$$\text{Home Expense} = S \times \frac{\text{home\_pct}}{100}$$
$$\text{Investment} = S \times \frac{\text{invest\_pct}}{100}$$
$$\text{Emergency Fund} = S \times \frac{\text{emergency\_pct}}{100}$$
$$\text{Car / Travel} = S \times \frac{\text{travel\_pct}}{100}$$
$$\text{Personal Expense} = S \times \frac{\text{personal\_pct}}{100}$$

### Rule Validation Constraint
$$\text{home\_pct} + \text{invest\_pct} + \text{emergency\_pct} + \text{travel\_pct} + \text{personal\_pct} = 100\%$$

---

## 3. Goal Completion Timeframe Model

For any goal bucket (e.g. New Bike, Goa Trip, Emergency Fund runway):

$$\text{Months Needed} = \left\lceil \frac{\text{Target Amount} - \text{Current Saved}}{\text{Monthly Allocation Contribution}} \right\rceil$$
