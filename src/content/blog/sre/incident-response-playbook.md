---
title: "Building an Incident Response Playbook"
date: "2025-02-15"
category: "sre"
excerpt: "How to structure incident response processes that actually work under pressure."
tags: ["sre", "incident-response", "oncall"]
---

## Why Playbooks Matter

When production is on fire at 3 AM, you don't want to be figuring out the process. A well-structured playbook turns chaos into a sequence of executable steps.

## The Structure

Every playbook should answer three questions:

1. **What's happening?** — Detection and classification
2. **Who does what?** — Roles and responsibilities
3. **How do we fix it?** — Step-by-step remediation

## Severity Levels

| Level | Impact | Response Time | Who's Paged |
|-------|--------|--------------|-------------|
| SEV1 | Full outage | Immediate | Incident Commander + On-call |
| SEV2 | Partial degradation | 15 min | On-call engineer |
| SEV3 | Minor impact | Next business day | Team lead |

## Post-Incident

The blameless postmortem is where real learning happens. Focus on:

- Timeline reconstruction
- Contributing factors (not root cause — it's rarely just one thing)
- Action items with owners and deadlines

> The goal isn't to prevent all incidents. It's to get better at responding to them.
