alter table public.users drop constraint if exists users_id_check;
alter table public.users add constraint users_id_check check (id ~ '^usr_[A-Za-z0-9_-]+$');

alter table public.payments drop constraint if exists payments_id_check;
alter table public.payments add constraint payments_id_check check (id ~ '^pay_[A-Za-z0-9_-]+$');
