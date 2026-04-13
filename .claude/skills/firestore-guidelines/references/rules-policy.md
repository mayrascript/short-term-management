# Rules Policy

## Current baseline

The repo currently uses permissive Firestore rules:

- all reads allowed
- all writes allowed

This is explicitly baseline behavior, not the long-term target.

## Required review

Whenever a feature:

- creates a new collection
- changes access semantics
- introduces ownership or role-based behavior
- adds sensitive data

You must review `firestore.rules`.

## Minimum expectation

A Firestore feature must answer:

- who can read?
- who can write?
- which fields are sensitive?
- does the baseline rule remain acceptable?

If the answer is “rules unchanged for now”, document that the rules were reviewed and why no change was made.

## Auditor usage

If rules change materially, use the installed `firestore-security-rules-auditor` skill as part of the review.
