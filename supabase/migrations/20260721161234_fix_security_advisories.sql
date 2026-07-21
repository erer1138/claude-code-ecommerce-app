-- แก้ 2 ประเด็นจาก security advisor หลัง apply ecommerce_schema:
-- 1) public bucket ไม่ควรมี SELECT policy บน storage.objects (เปิด listing ไฟล์ทั้งหมด) —
--    bucket public=true อ่านไฟล์ตรงได้อยู่แล้วโดยไม่ต้องมี policy
-- 2) SECURITY DEFINER trigger functions ถูก expose เป็น public RPC endpoint โดย default
--    (Postgres grant EXECUTE ให้ PUBLIC อัตโนมัติ) ต้อง revoke ออก — trigger ยังทำงานได้ปกติ
--    เพราะการยิง trigger ไม่ผ่านการเช็ค EXECUTE grant ของ role ที่ทำ DML

drop policy "product_images_read_public" on storage.objects;

revoke execute on function public.handle_new_user()        from public, anon, authenticated;
revoke execute on function public.pin_order_item_price()    from public, anon, authenticated;
revoke execute on function public.recompute_order_total()   from public, anon, authenticated;
