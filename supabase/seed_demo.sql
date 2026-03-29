-- =============================================================================
-- Caretaker AI — DEMO SEED DATA (investors / user demos)
-- Paste into Supabase → SQL → New query → Run as one script.
--
-- BEFORE YOU RUN:
-- 1. Replace ONLY the UUID in v_manager below (line with := '...') with YOUR
--    dashboard user id. Find it: Dashboard → Authentication → Users → copy UUID,
--    or run:  select id, email from auth.users;
-- 2. Run supabase/schema.sql first so all tables/columns exist.
--
-- WARNING: Deletes ALL rows for that manager_id in these tables, then inserts
-- fresh demo data. Use a dedicated demo login if you need to keep other data.
-- =============================================================================

do $seed$
declare
  v_manager uuid := 'a7694d82-1fee-427f-928d-227c8ccbcaa2'; -- ◄◄◄ REPLACE with your auth.users id

  p_lekki    uuid := 'a1000000-0000-4000-8000-000000000001';
  p_surulere uuid := 'a1000000-0000-4000-8000-000000000002';
  p_ikeja    uuid := 'a1000000-0000-4000-8000-000000000003';

  t_emeka    uuid := 'b2000000-0000-4000-8000-000000000001';
  t_chidi    uuid := 'b2000000-0000-4000-8000-000000000002';
  t_fatima   uuid := 'b2000000-0000-4000-8000-000000000003';
  t_ngozi    uuid := 'b2000000-0000-4000-8000-000000000004';
  t_kofi     uuid := 'b2000000-0000-4000-8000-000000000005';
  t_adaeze   uuid := 'b2000000-0000-4000-8000-000000000006';
  t_tunde    uuid := 'b2000000-0000-4000-8000-000000000007';
  t_sade     uuid := 'b2000000-0000-4000-8000-000000000008';
  t_blessing uuid := 'b2000000-0000-4000-8000-000000000009';

  v_plumb uuid := 'c3000000-0000-4000-8000-000000000001';
  v_elec  uuid := 'c3000000-0000-4000-8000-000000000002';
  v_ac    uuid := 'c3000000-0000-4000-8000-000000000003';

  i1 uuid := 'd4000000-0000-4000-8000-000000000001';
  i2 uuid := 'd4000000-0000-4000-8000-000000000002';
  i3 uuid := 'd4000000-0000-4000-8000-000000000003';
  i4 uuid := 'd4000000-0000-4000-8000-000000000004';
  i5 uuid := 'd4000000-0000-4000-8000-000000000005';
  i6 uuid := 'd4000000-0000-4000-8000-000000000006';
  i7 uuid := 'd4000000-0000-4000-8000-000000000007';
  i8 uuid := 'd4000000-0000-4000-8000-000000000008';
  i9 uuid := 'd4000000-0000-4000-8000-000000000009';

  x1 uuid := 'e5000000-0000-4000-8000-000000000001';
  x2 uuid := 'e5000000-0000-4000-8000-000000000002';
  x3 uuid := 'e5000000-0000-4000-8000-000000000003';
  x4 uuid := 'e5000000-0000-4000-8000-000000000004';
  x5 uuid := 'e5000000-0000-4000-8000-000000000005';
  x6 uuid := 'e5000000-0000-4000-8000-000000000006';
  x7 uuid := 'e5000000-0000-4000-8000-000000000007';
  x8 uuid := 'e5000000-0000-4000-8000-000000000008';

  now_ts timestamptz := now();
  log1 jsonb := '[{"at":"2026-03-18T08:12:00Z","actor":"ai","message":"Logged from WhatsApp: tenant reports issue."}]'::jsonb;
  log2 jsonb := '[{"at":"2026-03-19T14:00:00Z","actor":"manager","message":"Vendor assigned."}]'::jsonb;
begin
  if v_manager = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Replace v_manager with your auth.users id (Authentication → Users).';
  end if;

  delete from public.inbox_messages
  where thread_id in (select id from public.inbox_threads where manager_id = v_manager);
  delete from public.inbox_threads where manager_id = v_manager;
  delete from public.broadcast_logs where manager_id = v_manager;
  delete from public.receipts where manager_id = v_manager;
  delete from public.complaints where manager_id = v_manager;
  delete from public.payments where manager_id = v_manager;
  delete from public.invoices where manager_id = v_manager;
  delete from public.units where property_id in (select id from public.properties where manager_id = v_manager);
  delete from public.tenants where manager_id = v_manager;
  delete from public.vendors where manager_id = v_manager;
  delete from public.properties where manager_id = v_manager;

  -- 3 properties — Lagos
  insert into public.properties (id, manager_id, name, location, property_type, number_of_units, expected_monthly_revenue, created_at)
  values
    (p_lekki, v_manager, 'Ojukwu Heights', 'Lekki Phase 1, Lagos', 'mixed-use', 8, 4200000, now_ts - interval '14 months'),
    (p_surulere, v_manager, 'Ngozi Court', 'Surulere, Lagos', 'residential', 6, 2100000, now_ts - interval '9 months'),
    (p_ikeja, v_manager, 'Adaeze Plaza', 'Ikeja GRA, Lagos', 'commercial', 4, 1800000, now_ts - interval '20 months');

  insert into public.vendors (id, manager_id, name, trade, phone, email, notes, status, assigned_properties, rating, created_at)
  values
    (v_plumb, v_manager, 'Lagos Flow Plumbing Ltd', 'plumber', '+234 803 456 7821', 'jobs@lagosflow.example', 'Reliable for block work.', 'available', 'Ojukwu Heights, Ngozi Court', 4.7, now_ts - interval '400 days'),
    (v_elec, v_manager, 'VoltFix Electrical', 'electrician', '+234 807 112 9034', 'dispatch@voltfix.example', 'DB and reruns.', 'busy', 'Ojukwu Heights', 4.5, now_ts - interval '300 days'),
    (v_ac, v_manager, 'CoolBreeze AC Services', 'ac-technician', '+234 809 221 4450', 'hello@coolbreeze.example', 'Split units specialist.', 'available', 'Ngozi Court, Adaeze Plaza', 4.8, now_ts - interval '250 days');

  -- 9 tenants — paid / pending / overdue; lease end dates keep “expiring soon” fresh
  insert into public.tenants (id, manager_id, property_id, full_name, phone, unit, annual_service_charge, caution_deposit, lease_start_date, lease_expiry_date, payment_status, created_at)
  values
    (t_emeka, v_manager, p_lekki, 'Emeka Okafor', '+234 803 901 2244', 'A1', 2880000, 400000, (now_ts - interval '500 days')::date, (now_ts + interval '400 days')::date, 'paid', now_ts - interval '500 days'),
    (t_chidi, v_manager, p_lekki, 'Chidi Nwosu', '+234 805 772 1180', 'B2', 2400000, 350000, (now_ts - interval '480 days')::date, (now_ts + interval '220 days')::date, 'paid', now_ts - interval '480 days'),
    (t_kofi, v_manager, p_lekki, 'Kofi Mensah', '+234 802 445 0091', 'PH-A', 4200000, 600000, (now_ts - interval '420 days')::date, (now_ts + interval '300 days')::date, 'paid', now_ts - interval '420 days'),
    (t_tunde, v_manager, p_lekki, 'Tunde Bakare', '+234 808 334 7712', 'C4', 2160000, 300000, (now_ts - interval '300 days')::date, (now_ts + interval '70 days')::date, 'overdue', now_ts - interval '300 days'),
    (t_fatima, v_manager, p_surulere, 'Fatima Ibrahim', '+234 701 889 3344', '101', 1800000, 250000, (now_ts - interval '360 days')::date, (now_ts + interval '160 days')::date, 'pending', now_ts - interval '360 days'),
    (t_ngozi, v_manager, p_surulere, 'Ngozi Eze', '+234 816 220 4455', '2B', 1320000, 180000, (now_ts - interval '600 days')::date, (now_ts + interval '100 days')::date, 'overdue', now_ts - interval '600 days'),
    (t_sade, v_manager, p_surulere, 'Sade Williams', '+234 904 556 1200', '201', 1920000, 220000, (now_ts - interval '70 days')::date, (now_ts + interval '320 days')::date, 'paid', now_ts - interval '70 days'),
    (t_adaeze, v_manager, p_ikeja, 'Adaeze Okonkwo', '+234 813 667 8890', 'Shop 3', 960000, 120000, (now_ts - interval '200 days')::date, (now_ts + interval '45 days')::date, 'pending', now_ts - interval '200 days'),
    (t_blessing, v_manager, p_ikeja, 'Blessing Okoro', '+234 907 120 3344', 'Unit D1', 840000, 100000, (now_ts - interval '45 days')::date, (now_ts + interval '52 days')::date, 'pending', now_ts - interval '45 days');

  -- Paid invoices + ledger + receipts (YTD / receipts tab)
  insert into public.invoices (id, manager_id, tenant_id, amount, status, due_date, reference, created_at, issued_at, tenant_confirmation, confirmation_at, pdf_url)
  values
    (i1, v_manager, t_emeka, 240000, 'paid', (now_ts - interval '5 days')::date, 'INV-LEK-2026-03-EME', now_ts - interval '25 days', now_ts - interval '25 days', 'Paid via GTBank transfer. Ref: GTB-99281', now_ts - interval '23 days', null),
    (i2, v_manager, t_chidi, 200000, 'paid', (now_ts - interval '3 days')::date, 'INV-LEK-2026-03-CHI', now_ts - interval '22 days', now_ts - interval '22 days', 'Done. Sent proof on WhatsApp.', now_ts - interval '21 days', null),
    (i3, v_manager, t_kofi, 350000, 'paid', (now_ts - interval '5 days')::date, 'INV-LEK-2026-03-KOF', now_ts - interval '24 days', now_ts - interval '24 days', 'Payment completed.', now_ts - interval '20 days', null),
    (i4, v_manager, t_sade, 160000, 'paid', (now_ts - interval '2 days')::date, 'INV-SUR-2026-03-SAD', now_ts - interval '18 days', now_ts - interval '18 days', 'Paid 🙏', now_ts - interval '17 days', null);

  insert into public.payments (manager_id, tenant_id, amount, created_at, metadata)
  values
    (v_manager, t_emeka, 240000, now_ts - interval '23 days', jsonb_build_object('source', 'approval', 'invoice_id', i1::text)),
    (v_manager, t_chidi, 200000, now_ts - interval '21 days', jsonb_build_object('source', 'approval', 'invoice_id', i2::text)),
    (v_manager, t_kofi, 350000, now_ts - interval '20 days', jsonb_build_object('source', 'approval', 'invoice_id', i3::text)),
    (v_manager, t_sade, 160000, now_ts - interval '17 days', jsonb_build_object('source', 'approval', 'invoice_id', i4::text));

  insert into public.receipts (manager_id, tenant_id, invoice_id, amount, payment_date, sent_at, reference, pdf_url)
  values
    (v_manager, t_emeka, i1, 240000, (now_ts - interval '23 days')::date, now_ts - interval '23 days', 'RCPT-EME-99281', null),
    (v_manager, t_chidi, i2, 200000, (now_ts - interval '21 days')::date, now_ts - interval '21 days', 'RCPT-CHI-11209', null),
    (v_manager, t_kofi, i3, 350000, (now_ts - interval '20 days')::date, now_ts - interval '20 days', 'RCPT-KOF-88331', null),
    (v_manager, t_sade, i4, 160000, (now_ts - interval '17 days')::date, now_ts - interval '17 days', 'RCPT-SAD-44102', null);

  -- Approvals queue (manager must approve)
  insert into public.invoices (id, manager_id, tenant_id, amount, status, due_date, reference, created_at, issued_at, tenant_confirmation, confirmation_at, pdf_url)
  values
    (i5, v_manager, t_fatima, 150000, 'awaiting-approval', (now_ts + interval '18 days')::date, 'INV-SUR-2026-03-FAT', now_ts - interval '3 days', now_ts - interval '3 days',
     'I have paid N150,000 to your Zenith account ending 4421. Name on transfer is FATIMA IBRAHIM. Please confirm.', now_ts - interval '2 hours', null),
    (i6, v_manager, t_blessing, 70000, 'awaiting-approval', (now_ts + interval '21 days')::date, 'INV-IKE-2026-03-BLE', now_ts - interval '1 day', now_ts - interval '1 day',
     'Good afternoon, paid 70k now via OPay. Screenshot sent above.', now_ts - interval '30 minutes', null);

  -- Invoice sent — AI chasing (overdue / due soon depending on due_date)
  insert into public.invoices (id, manager_id, tenant_id, amount, status, due_date, reference, created_at, issued_at, tenant_confirmation, confirmation_at, pdf_url)
  values
    (i7, v_manager, t_tunde, 180000, 'invoice-sent', (now_ts - interval '7 days')::date, 'INV-LEK-2026-03-TUN', now_ts - interval '12 days', now_ts - interval '12 days', null, null, null),
    (i8, v_manager, t_ngozi, 110000, 'invoice-sent', (now_ts - interval '10 days')::date, 'INV-SUR-2026-03-NGO', now_ts - interval '16 days', now_ts - interval '16 days', null, null, null);

  insert into public.invoices (id, manager_id, tenant_id, amount, status, due_date, reference, created_at, issued_at, tenant_confirmation, confirmation_at, pdf_url)
  values
    (i9, v_manager, t_adaeze, 80000, 'disputed', (now_ts + interval '5 days')::date, 'INV-IKE-2026-03-ADA', now_ts - interval '8 days', now_ts - interval '8 days', null, null, null);

  -- 8 complaints — stale unassigned, critical AC, in progress, resolved + costs
  insert into public.complaints (id, manager_id, property_id, tenant_id, vendor_id, type, status, priority, description, activity_log, created_at, updated_at, resolved_at, job_cost, job_notes)
  values
    (x1, v_manager, p_lekki, t_emeka, null, 'Plumbing', 'open', 'high',
     'Kitchen sink blocked and water backing up into the pantry. Photos sent on WhatsApp.',
     log1, now_ts - interval '92 hours', now_ts - interval '90 hours', null, null, null),
    (x6, v_manager, p_lekki, t_tunde, null, 'Security', 'open', 'high',
     'Street gate remote not working; visitors stuck outside twice this week.',
     log1, now_ts - interval '120 hours', now_ts - interval '118 hours', null, null, null),
    (x3, v_manager, p_surulere, t_fatima, null, 'AC Fault', 'open', 'critical',
     'Split unit blowing warm air only. Baby and elderly mum at home — please urgent.',
     log1, now_ts - interval '26 hours', now_ts - interval '24 hours', null, null, null),
    (x2, v_manager, p_lekki, t_chidi, v_elec, 'Electrical', 'in-progress', 'medium',
     'DB tripping when kettle + microwave run. Sparking sound reported.',
     log2, now_ts - interval '50 hours', now_ts - interval '30 hours', null, null, null),
    (x5, v_manager, p_lekki, t_kofi, v_plumb, 'Plumbing', 'open', 'low',
     'Guest toilet slow drain.',
     log1, now_ts - interval '12 hours', now_ts - interval '10 hours', null, null, null),
    (x4, v_manager, p_surulere, t_ngozi, v_ac, 'Pest Control', 'resolved', 'medium',
     'Cockroaches in kitchen cabinets; need fumigation.',
     log2, now_ts - interval '200 hours', now_ts - interval '40 hours', now_ts - interval '36 hours', 45000, '2-room spray + gel bait'),
    (x7, v_manager, p_surulere, t_sade, v_elec, 'Electrical', 'resolved', 'low',
     'One socket in bedroom dead.',
     log2, now_ts - interval '300 hours', now_ts - interval '80 hours', now_ts - interval '78 hours', 28000, 'Replaced faulty breaker'),
    (x8, v_manager, p_ikeja, t_adaeze, null, 'Electrical', 'open', 'medium',
     'Shop signboard LED flickering; outdoor cable may be damaged.',
     log1, now_ts - interval '8 hours', now_ts - interval '6 hours', null, null, null);

end
$seed$;

-- Pitch story:
-- • Lekki: solid payers (Emeka, Chidi, Kofi) vs Tunde overdue + invoice-sent + 2 urgent unassigned complaints (plumbing 4d, security 5d).
-- • Surulere: Fatima + Ngozi money tension; Fatima’s payment waits on YOUR approval; critical AC; closed pest job with logged ₦ cost.
-- • Ikeja: Blessing awaiting approval; Adaeze disputed line; small open electrical ticket.
