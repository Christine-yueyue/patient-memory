// Synthetic sample transcripts for the ContinuCare AI demo.
// Fictional patients. PII included intentionally to demonstrate the privacy shield.

const transcripts = {
  'Visit 1 — New patient, diabetes + hypertension': `Doctor: Good morning, Martha Collins! I'm Dr. Ahmed. Let me pull up your chart. Can you confirm your date of birth?
Patient: January 15, 1966. Health card is 4823917650AB. I live at 155 Laurier Ave, Ottawa, K1A 0P7.
Doctor: Perfect. So Martha, what brings you in today?
Patient: My legs have been swelling and I've been exhausted. Also forgetting things. My sister is worried.
Doctor: Your blood pressure is 148 over 92 today, which is elevated. Do you have a history of diabetes in the family?
Patient: Yes, my mother had it. I was told I was borderline last year but never followed up.
Doctor: Your last HbA1c on file is 8.2 — that's in the diabetic range. You've been on metformin 500mg but I see some gaps in the refills.
Patient: I ran out and kept forgetting to call. My phone is 613-555-0192 if you want to leave reminders.
Doctor: I'm going to order a CBC, urine albumin, and fasting glucose today. Let's increase your ramipril to 10mg for the blood pressure. Come back in 6 weeks.
Patient: Will I need to see a specialist?
Doctor: Not yet. If blood pressure doesn't improve we'll refer to nephrology. For now let's get the labs and adjust medications.`,

  'Visit 2 — Lab review, nephrology referral': `Doctor: Hi Martha Collins, good to see you back. I have your lab results here.
Patient: I've been nervous. Is everything okay?
Doctor: The CBC came back normal. Urine albumin was slightly elevated at 45 mg — that tells us the kidneys are under a bit of stress. How has the ramipril 10mg been?
Patient: I take it every day now. The leg swelling is much better. No side effects.
Doctor: Your blood pressure today is 134 over 84 — that's a real improvement. HbA1c is still pending from last week's draw, we'll have it soon.
Patient: And the diabetes? Should I be worried?
Doctor: We're managing it. Given the albumin result I want to refer you to nephrology now — they'll monitor kidney function more closely. Keep taking the metformin 500mg. Any questions?
Patient: No, I just want to stay on top of it. My email is martha.c@outlook.com if you can send reminders.
Doctor: Noted. See you in 3 months, and the nephrology appointment should come through in 4 to 6 weeks.`,

  'Visit 3 — Neuropathy symptoms, A1c improving': `Doctor: Hi Martha. How have things been since I last saw you?
Patient: Better overall. The nephrology appointment was helpful — they just want to monitor for now. But I have new numbness in my toes at night. Keeps waking me up.
Doctor: That can be diabetic neuropathy. Have you been keeping up with the metformin?
Patient: Only missed it once this month. I set phone alarms now.
Doctor: Good habit. Your blood pressure today is 132 over 80 — stable and trending down. Your A1c came back at 7.6, which is a real improvement from 8.2.
Patient: That's encouraging.
Doctor: I want to check a B12 level today — B12 deficiency can cause neuropathy and metformin can deplete it over time. I'll also do a foot exam.
Patient: Okay, go ahead.
Doctor: Foot exam looks okay — sensation reduced in the toes bilaterally but no ulcers. Continue ramipril 10mg and metformin 500mg. Follow up in 8 weeks. If B12 is low we'll start supplementation.`,

  'Visit 4 — Stable, preventive care': `Doctor: Hi Martha Collins, great to see you. B12 came back slightly low at 180 — we'll start B12 1000mcg daily. How's the toe numbness?
Patient: Much less frequent. Maybe once a week now instead of every night.
Doctor: That's a real win. Blood pressure today is 128 over 78 — excellent.
Doctor: I also want to talk about preventive things today. Are you due for a mammogram?
Patient: I think it's been 2 years.
Doctor: I'll put in a referral. Also, flu shot coming into fall — can you book that at the pharmacy?
Patient: Yes, I'll do that.
Doctor: Your A1c recheck is due in 3 months. Keep all current medications — ramipril 10mg, metformin 500mg, B12 1000mcg. No new referrals except the mammogram. You're doing really well.
Patient: Thank you, doctor. This system has been so much better than my old clinic where they never remembered anything.`,
};

export default transcripts;
