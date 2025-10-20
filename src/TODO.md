# ✅ Tinedy CRM - Feature Development Checklist

ไฟล์นี้ใช้สำหรับติดตามความคืบหน้าในการพัฒนาฟีเจอร์ใหม่ๆ เพื่อให้การทำงานเป็นไปอย่างต่อเนื่องและไม่ตกหล่น

---

## E7: Team Management

**Epic Description**: เปิดใช้งานการสร้างและจัดการทีมของพนักงานสำหรับงานที่ซับซ้อนซึ่งต้องการผู้ให้บริการหลายคนทำงานร่วมกัน

---

### Phase 1: Core Team Structure & Management (การวางรากฐานและจัดการทีม)

เป้าหมายของเฟสนี้คือการสร้างโครงสร้างข้อมูลและหน้าจอ UI พื้นฐานสำหรับการสร้าง, ดู, และแก้ไขทีม

- [x] **Story E7-1: Create Team**
    - [x] **Backend:** อัปเดต `schema.md` เพื่อเพิ่มตารางใหม่:
        - [x] `teams` (id, name, description, status, lead_member_id)
        - [x] `team_members` (team_id, staff_id)
    - [x] **Data Access Layer (DAL):** สร้างไฟล์ `dal/teams.ts` พร้อมฟังก์ชัน `createTeam`, `addMembersToTeam`, `updateTeam`
    - [x] **UI:** สร้างหน้า "Teams" ใหม่ (`views/TeamsView.tsx` และ `components/teams/TeamsPage.tsx`)
    - [x] **UI:** สร้างฟอร์มสำหรับสร้าง/แก้ไขทีม (`components/teams/TeamForm.tsx`)
        - [x] Input สำหรับชื่อและคำอธิบายทีม
        - [x] Dropdown สำหรับค้นหาและเลือกสมาชิกในทีม
        - [x] Radio button สำหรับเลือกหัวหน้าทีม (Team Lead)
        - [x] Toggle สำหรับสถานะ Active/Inactive
    - [x] **State Management:** สร้าง `store/teamStore.ts` เพื่อจัดการ State ของทีม
    - [x] **Business Logic:** Implement กฎการสร้างทีมในฟอร์ม
        - [x] ทีมต้องมีสมาชิกอย่างน้อย 2 คน
        - [x] พนักงานหนึ่งคนสามารถอยู่ในทีมได้สูงสุด 3 ทีม
    - [x] **Navigation:** เพิ่มเมนู "Teams" ใน Sidebar

- [x] **Story E7-2: View Team Profile**
    - [x] **UI:** สร้าง Modal `components/teams/TeamDetailsModal.tsx` สำหรับแสดงข้อมูล chi tiết ของทีม
    - [x] **UI:** แสดงชื่อ, คำอธิบาย, หัวหน้าทีม และรายชื่อสมาชิกทั้งหมด
    - [x] **UI:** แสดงทักษะ (Skills) ทั้งหมดที่มีในทีม
    - [x] **UI:** เพิ่มปุ่ม "Edit" เพื่อเปิดฟอร์มแก้ไขทีม

- [x] **Story E7-3: Edit Team Composition**
    - [x] **DAL:** เพิ่มฟังก์ชัน `removeMemberFromTeam`, `changeTeamLead` ใน `dal/teams.ts`
    - [x] **UI:** ทำให้ `TeamForm.tsx` รองรับการแก้ไขข้อมูล
        - [x] สามารถเพิ่ม/ลบสมาชิกออกจากทีมได้
        - [x] แสดงคำเตือนเมื่อลบสมาชิกที่มีผลกระทบต่องานในอนาคต
        - [x] สามารถเปลี่ยนหัวหน้าทีมได้
    - [x] **Business Logic:** ป้องกันไม่ให้ลบสมาชิกจนเหลือน้อยกว่า 2 คน

---

### Phase 2: Team Assignment & Scheduling (การมอบหมายงานและจัดตารางให้ทีม)

เป้าหมายของเฟสนี้คือการนำระบบทีมไปปรับใช้กับ Workflow การจองและตารางงานปัจจุบัน

- [x] **Story E7-4: Assign Team to Booking**
    - [x] **Backend:** อัปเดต `schema.md` ในตาราง `bookings`
        - [x] เพิ่มคอลัมน์ `assigned_team_id` (FOREIGN KEY to `teams.id`)
    - [x] **DAL:** อัปเดต `dal/bookings.ts` เพิ่มฟังก์ชัน `assignTeamToBooking(bookingId, teamId)`
    - [x] **UI:** เพิ่มตัวเลือก "Assign Team" ในหน้า `BookingDetailsModal` และ `GlobalAvailabilityChecker`
    - [x] **UI:** แสดงรายชื่อทีมที่พร้อมให้บริการในรูปแบบการ์ด
    - [x] **Logic:** ตรวจสอบ Conflict ของสมาชิก **ทุกคน** ในทีมก่อนทำการมอบหมายงาน
    - [x] **UI:** อัปเดตหน้า `BookingItem` และ `ScheduleBookingItem` ให้แสดงผลเมื่อมีการมอบหมายงานให้ทีม

- [x] **Story E7-5: Team Availability Check**
    - [x] **UI:** เพิ่มแท็บ "Team Availability" ใน `GlobalAvailabilityChecker.tsx`
    - [x] **Logic:** พัฒนาฟังก์ชันตรวจสอบตารางเวลาของสมาชิกทุกคนในทีมพร้อมกัน
    - [x] **UI:** แสดงผลลัพธ์การตรวจสอบเป็น:
        - [x] **Fully Available:** สมาชิกทุกคนว่าง
        - [x] **Partially Available:** สมาชิกบางคนว่าง (พร้อมระบุว่าใครไม่ว่าง)
        - [x] **Unavailable:** สมาชิกทุกคนไม่ว่าง
    - [x] **UI (Advanced):** แสดงคำแนะนำวันที่อื่นที่ทีมว่างพร้อมกัน
    - [x] **UI (Advanced):** แนะนำสมาชิกคนอื่นมาแทนที่คนที่ไม่ว่าง

---

### Phase 3: Team Analytics & Reporting (การวิเคราะห์และรายงานผล)

เป้าหมายของเฟสนี้คือการสร้างระบบรายงานเพื่อวัดผลและประสิทธิภาพการทำงานของทีม

- [x] **Story E7-6: Team Performance Tracking**
    - [x] **Logic:** สร้าง Hook `hooks/useTeamPerformance.ts` สำหรับคำนวณสถิติของทีม
        - [x] จำนวนงานที่ทำสำเร็จ
        - [x] รายได้รวมที่ทีมสร้าง
        - [x] ค่าเฉลี่ยเรตติ้งของงานที่ทำโดยทีม
    - [x] **UI:** เพิ่มส่วนแสดงผลสถิติในหน้า `TeamDetailsModal.tsx`
    - [x] **UI:** เพิ่มประเภทรายงาน "Team Performance" ในหน้า `ReportsView.tsx`
    - [x] **Logic:** Implement ฟังก์ชัน Export รายงานของทีมเป็นไฟล์ CSV

---

## E9: Mobile Staff Portal (Phase 2)

**Epic Description**: Provide mobile-optimized portal for staff to view schedules, update job status, manage availability, and communicate with admin.

---

### Phase 1: Foundation & Core Job Management (รากฐานและฟังก์ชันจัดการงานหลัก)

เป้าหมาย: สร้างฟังก์ชันที่จำเป็นที่สุดสำหรับพนักงานในการล็อกอิน, ดูตารางงาน, และอัปเดตสถานะงานประจำวัน

- [x] **Story E9-1: Staff Login & Authentication**
    - [x] Implement role-based redirect after login.
    - [ ] Login with phone number and password
    - [ ] Password requirements: min 8 characters
    - [ ] "Remember me" option (30-day session)
    - [ ] Forgot password flow via SMS OTP
    - [ ] Automatic logout after 7 days inactivity
    - [ ] Can change password in settings
    - [ ] Login attempts logged for security
    - [ ] Works on iOS Safari and Android Chrome
    - [ ] Responsive design for all phone sizes
    - [ ] _(Future)_ Touch ID / Face ID support

- [x] **Story E9-2: Staff Dashboard (Home Screen)**
    - [x] Shows today's jobs at top
    - [x] Tomorrow's jobs section
    - [x] Upcoming jobs (next 7 days)
    - [x] Each job card shows: time, customer name, address, service type, duration
    - [x] Status indicators on each job
    - [ ] Quick stats: Jobs today, This week, This month
    - [ ] Current performance rating displayed
    - [ ] Pull-to-refresh to update
    - [ ] "Running late" quick action button
    - [ ] Loads in <2 seconds on 4G
    - [ ] Works offline (shows cached data)

- [x] **Story E9-3: View Job Details**
    - [x] Tap job card to open details
    - [x] Shows: customer name, phone (tap to call)
    - [x] Full address with "Get Directions" button (opens Google Maps)
    - [x] Service type and requirements
    - [x] Estimated duration
    - [x] Special requirements/notes from customer
    - [ ] Admin notes for staff
    - [ ] Customer photo/icon (if available)
    - [ ] Previous visit notes (if repeat customer)
    - [x] Can view in Thai or English
    - [ ] Contact admin button
    - [ ] Emergency contact quick dial

- [x] **Story E9-4: Update Job Status**
    - [x] Status buttons: Start Job, Complete Job
    - [x] "Start Job" records timestamp
    - [ ] "Start Job" optional: upload arrival photo
    - [x] "Complete Job" requires: actual end time, completion notes
    - [ ] "Complete Job" optional: upload completion photos (before/after)
    - [x] Can't complete without starting
    - [x] Confirmation dialog for completion
    - [x] Status updates sync immediately
    - [x] Visible in admin dashboard within seconds
    - [ ] Works offline (syncs when back online)
    - [ ] Push notification to admin on status change

- [x] **Story E9-5: Report Issues During Job**
    - [x] "Report Issue" button prominent on job detail
    - [x] Issue categories: Access problem, Equipment issue, Safety concern, Customer issue, Other
    - [x] Description field (required)
    - [ ] Can upload photos
    - [x] Severity: Low, Medium, High, Emergency
    - [x] Emergency issues trigger immediate admin call/notification
    - [ ] Can continue or pause job after reporting
    - [ ] Admin receives notification immediately
    - [ ] Issue visible on booking in admin view
    - [ ] Can update issue status later
    - [x] Issue history visible to staff

---

### Phase 2: Self-Service & Schedule Management (การจัดการตารางเวลาด้วยตนเอง)

เป้าหมาย: เพิ่มความสามารถให้พนักงานจัดการตารางเวลาและการลาได้ด้วยตนเอง เพื่อลดภาระของแอดมิน

- [x] **Story E9-6: View & Manage My Availability**
    - [x] Calendar view of my schedule
    - [x] Shows: Assigned jobs
    - [x] Shows: Blocked time
    - [x] Can block time slots with reason
    - [x] Can block full days
    - [x] Reason dropdown: Personal, Appointment, Training, Other
    - [x] Can set recurring unavailability (e.g., every Monday morning)
    - [x] Warning if blocking time affects existing bookings
    - [ ] Changes require admin approval (configurable)
    - [ ] Can view pending availability requests
    - [x] Updates reflect in admin system immediately

- [x] **Story E9-7: Request Leave**
    - [x] "Request Leave" form accessible from menu
    - [x] Leave types: Annual, Sick, Personal, Emergency
    - [x] Date range picker (start and end date)
    - [x] Reason field (optional for annual, required for emergency)
    - [ ] Shows current leave balance
    - [x] Shows if requested dates affect any bookings
    - [ ] Can upload medical certificate for sick leave
    - [x] Submission confirmation message
    - [x] Status tracking: Pending, Approved, Rejected
    - [ ] Push notification when status changes
    - [x] Leave history visible
    - [x] Can cancel pending requests

---

### Phase 3: Communication & Performance (การสื่อสารและผลการปฏิบัติงาน)

เป้าหมาย: พัฒนาระบบสื่อสารระหว่างพนักงานและแอดมิน พร้อมทั้งให้พนักงานสามารถดูผลการปฏิบัติงานของตนเองได้

- [x] **Story E9-8: View My Performance**
    - [x] Performance page accessible from menu
    - [x] Shows: Average rating (stars), Jobs completed, Total Hours
    - [x] Monthly performance trend chart
    - [x] Recent customer feedback (positive and constructive)
    - [ ] Achievements/badges earned
    - [ ] Areas for improvement (if any)
    - [ ] Comparison to team average (optional)
    - [x] Can filter by time period
    - [ ] Encouraging messages for good performance
    - [ ] Constructive guidance for improvement areas
    - [x] Cannot see other staff members' performance

- [x] **Story E9-9: In-App Messaging with Admin**
    - [x] Chat interface with admin
    - [ ] Can attach photos
    - [x] Push notifications for new messages
    - [x] Message history saved
    - [ ] Typing indicator
    - [ ] Read receipts
    - [ ] Can reference specific jobs in chat
    - [ ] Emergency button for urgent matters (triggers call)
    - [ ] Admin sees all staff messages in unified inbox
    - [x] Message timestamps

- [x] **Story E9-10: Push Notifications** _(Note: Service Worker (`sw.js`) is now being served, resolving the 404 error and enabling offline capabilities. Full push notification logic is detailed below.)_
    - [ ] Push notification permissions requested on first login
    - [ ] Notifications for: New assignment, Job reminder, Schedule changes, Leave approval, Admin messages
    - [ ] Notification settings: Can enable/disable by type
    - [ ] Badge count on app icon
    - [ ] Tap notification opens relevant screen
    - [ ] Notification history in app
    - [ ] Works even when app closed
    - [ ] Respects Do Not Disturb hours (configurable)
    - [ ] Critical notifications override DND (emergency only)
    - [ ] Works on iOS and Android

---

### Phase 4: Technical Enhancements (การปรับปรุงทางเทคนิค)

เป้าหมาย: ปรับปรุงประสบการณ์ใช้งานโดยรวม เช่น การรองรับ Offline Mode เพื่อให้แอปพลิเคชันมีความเสถียรและใช้งานได้ในทุกสถานการณ์

- [x] **Story E9-11: Offline Mode Support**
    - [x] Today's schedule cached locally
    - [x] Job details available offline
    - [x] Can view customer address offline
    - [x] Status updates queued and sync when online
    - [x] Photos queued for upload when online
    - [x] Offline indicator visible
    - [x] Sync indicator when reconnected
    - [x] Conflicts resolved automatically or flagged
    - [x] Can dial customer even offline (uses phone dialer)
    - [x] Works smoothly transitioning online/offline

---

## Phase 5: Future Considerations & Deferred Features (พิจารณาสำหรับอนาคตและฟีเจอร์ที่ถูกเลื่อนออกไป)

**Epic Description**: เอกสารนี้รวบรวมฟังก์ชันที่ยังไม่ได้ถูกพัฒนาในเฟสปัจจุบัน พร้อมทั้งเหตุผลทางเทคนิคและกลยุทธ์ในการจัดลำดับความสำคัญ ฟังก์ชันเหล่านี้ไม่ใช่ "ทำไม่ได้" แต่ถูกพิจารณาให้เป็นส่วนเพิ่มเติมในอนาคตเพื่อรักษาความสมบูรณ์และเป้าหมายหลักของเวอร์ชันปัจจุบัน

---

### E9: Mobile Staff Portal

#### Story E9-10: Push Notifications (การแจ้งเตือนแบบพุช)

- `[ ] Push notification permissions requested on first login`:
    - **เหตุผล:** Supabase มีข้อจำกัดทางเทคนิคในการส่ง Push Notifications โดยตรงจาก Backend ในเวอร์ชันปัจจุบัน ฟังก์ชันนี้ต้องรอการสนับสนุนจาก Supabase Functions ในอนาคต
- `[ ] Notifications for: New assignment, Job reminder, Schedule changes, Leave approval, Admin messages`:
    - **เหตุผล:** เช่นเดียวกับข้อแรก, การส่ง Notification จาก Event ที่เกิดขึ้นใน Backend ต้องใช้ Supabase Functions
- `[ ] Notification settings: Can enable/disable by type`:
    - **เหตุผล:** UI สำหรับการตั้งค่านี้มีอยู่แล้ว แต่การทำงานจริงต้องรอการ Implement ที่ฝั่ง Backend
- `[ ] Badge count on app icon`:
    - **เหตุผล:** เป็นฟังก์ชันที่ต้องใช้ Badging API ซึ่งยังไม่รองรับในทุกเบราว์เซอร์ และมีความซับซ้อนในการ Implement ร่วมกับ Service Worker
- `[ ] Tap notification opens relevant screen`:
    - **เหตุผล:** ส่วนนี้ต้องมีการออกแบบ Data Payload ของ Notification อย่างละเอียดเพื่อให้สามารถระบุหน้าจอที่ถูกต้องได้
- `[ ] Notification history in app`:
    - **เหตุผล:** Implement ได้ไม่ยาก แต่ถูกเลื่อนออกไปเพื่อเน้นที่ฟังก์ชันหลักก่อน
- `[ ] Works even when app closed`:
    - **เหตุผล:** เป็นคุณสมบัติพื้นฐานของ Service Worker แต่การจัดการ State เมื่อแอปถูกเปิดจาก Notification มีความซับซ้อน
- `[ ] Respects Do Not Disturb hours (configurable)`:
    - **เหตุผล:** เป็นฟีเจอร์ขั้นสูงที่ต้องใช้ Logic เพิ่มเติมทั้งฝั่ง Client และ Backend
- `[ ] Critical notifications override DND (emergency only)`:
    - **เหตุผล:** เช่นเดียวกับข้อบน เป็นฟีเจอร์ขั้นสูง
- `[ ] Works on iOS and Android`:
    - **เหตุผล:** Push Notifications บน iOS (Web) ยังมีข้อจำกัดและทำงานได้ไม่สมบูรณ์เท่า Android

---

#### Story E9-1: Staff Login & Authentication (การล็อกอินและยืนยันตัวตน)

- `[ ] Login with phone number and password`:
    - **เหตุผล:** การล็อกอินด้วยเบอร์โทรศัพท์ต้องมีการปรับแก้โครงสร้างข้อมูล Backend และเชื่อมต่อกับระบบ SMS Gateway (OTP) ซึ่งมีความซับซ้อนและมีค่าใช้จ่ายเพิ่มเติม ปัจจุบันระบบใช้อีเมลเป็นมาตรฐานหลัก
- `[ ] Password requirements: min 8 characters`:
    - **เหตุผล:** นโยบายความปลอดภัยของรหัสผ่านถูกจัดการโดย Supabase Auth ที่ฝั่ง Backend อยู่แล้วเพื่อความปลอดภัยสูงสุด
- `[ ] "Remember me" option (30-day session)`:
    - **เหตุผล:** Supabase Client Library ที่ใช้มีการจัดการ Session ให้อัตโนมัติ ทำให้ผู้ใช้ล็อกอินค้างไว้ได้อยู่แล้ว ฟังก์ชันนี้จึงไม่จำเป็น
- `[ ] Forgot password flow via SMS OTP`:
    - **เหตุผล:** เช่นเดียวกับการล็อกอินด้วยเบอร์โทรศัพท์, การรีเซ็ตรหัสผ่านผ่าน SMS OTP จำเป็นต้องเชื่อมต่อกับบริการ SMS Gateway ภายนอกซึ่งมีค่าใช้จ่าย
- `[ ] Automatic logout after 7 days inactivity`:
    - **เหตุผล:** เป็นฟังก์ชันเสริมด้านความปลอดภัยที่สามารถเพิ่มได้ในอนาคต ในเฟสนี้เน้นความสะดวกในการใช้งานต่อเนื่องก่อน
- `[ ] Can change password in settings`:
    - **เหตุผล:** มีฟังก์ชันนี้อยู่แล้วใน Admin Portal การนำมาใส่ใน Staff Portal ถูกเลื่อนออกไปเพื่อให้ Portal นี้เน้นที่ฟังก์ชันการทำงานภาคสนามเป็นหลัก
- `[ ] Login attempts logged for security`:
    - **เหตุผล:** Supabase Auth มีระบบป้องกันการ Brute-force attack ในตัวอยู่แล้ว
- `[ ] (Future) Touch ID / Face ID support`:
    - **เหตุผล:** ถูกระบุไว้เป็น "Future" เนื่องจากต้องใช้ WebAuthn API ซึ่งเป็นเทคโนโลยีขั้นสูงและมีความซับซ้อนในการ Implement เหมาะสำหรับเฟสถัดไป

---

#### Story E9-2: Staff Dashboard (Home Screen) (หน้าแดชบอร์ด)

- `[ ] Quick stats: Jobs today, This week, This month`:
    - **เหตุผล:** เป็นการปรับปรุง UX ที่ดี แต่ในเฟสนี้ให้ความสำคัญกับการแสดงรายการงานที่ชัดเจนก่อน สถิติสามารถเพิ่มเข้ามาในเฟสต่อไปเพื่อแสดงภาพรวม
- `[ ] Current performance rating displayed`:
    - **เหตุผล:** ข้อมูล Performance ถูกรวมไว้ในหน้า "Profile" แล้ว เพื่อให้พนักงานได้ดูรายละเอียดเชิงลึก การนำมาไว้ที่หน้าแรกอาจทำให้ UI รกเกินความจำเป็น
- `[ ] Pull-to-refresh to update`:
    - **เหตุผล:** แอปเชื่อมต่อกับ Supabase Realtime ซึ่งข้อมูลจะอัปเดตเองโดยอัตโนมัติ ทำให้ฟังก์ชันนี้มีความจำเป็นน้อยลง และการ Implement ในเว็บแอปให้เหมือน Native App ต้องใช้ Library เฉพาะซึ่งเพิ่มความซับซ้อน
- `[ ] "Running late" quick action button`:
    - **เหตุผล:** เป็นฟีเจอร์ที่ดี แต่มีความซับซ้อนเบื้องหลังสูง (ต้องส่ง Notification, บันทึก Log, อาจต้องแจ้งลูกค้า) จึงถูกจัดเป็นฟีเจอร์ที่ต้องวางแผนแยกต่างหาก

---

#### Story E9-3: View Job Details (ดูรายละเอียดงาน)

- `[ ] Admin notes for staff`:
    - **เหตุผล:** ต้องมีการเพิ่มคอลัมน์ใหม่ใน Database schema สำหรับบันทึกจากแอดมินโดยเฉพาะ
- `[ ] Customer photo/icon (if available)`:
    - **เหตุผล:** ต้องมีการเพิ่มคอลัมน์ `avatar_url` ในตาราง `customers` และเชื่อมต่อกับระบบ File Storage (เช่น Supabase Storage)
- `[ ] Previous visit notes (if repeat customer)`:
    - **เหตุผล:** ต้องใช้ Logic ในการดึงข้อมูลประวัติการจองทั้งหมดของลูกค้าคนนั้นมาแสดงผล ซึ่งเพิ่มความซับซ้อนในการดึงข้อมูลและ UI
- `[ ] Can view in Thai or English`:
    - **เหตุผล:** การทำระบบสองภาษา (i18n) เป็นงานใหญ่ระดับสถาปัตยกรรมของแอปพลิเคชัน ถูกกำหนดไว้เป็นโปรเจกต์ใหญ่ในอนาคต
- `[ ] Contact admin button`:
    - **เหตุผล:** ถูก **Implement แล้ว** ในรูปแบบของแท็บ **"แชท" (Chat)** ที่ Bottom Navigation Bar ซึ่งเป็นช่องทางการสื่อสารที่ดีกว่า
- `[ ] Emergency contact quick dial`:
    - **เหตุผล:** เป็นฟีเจอร์ที่ดีด้านความปลอดภัย แต่ยังไม่มีการกำหนดข้อมูล "ผู้ติดต่อฉุกเฉิน" ในระบบ จึงต้องมีการออกแบบและเพิ่มส่วนนี้ก่อน

---

#### Story E9-4: Update Job Status (อัปเดตสถานะงาน)

- `[ ] "Start Job" optional: upload arrival photo` & `[ ] "Complete Job" optional: upload completion photos`:
    - **เหตุผล:** การอัปโหลดรูปภาพจำเป็นต้องเชื่อมต่อกับบริการ File Storage และจัดการการเข้าถึงกล้อง/ไฟล์ในมือถือ ซึ่งเป็นฟังก์ชันที่ซับซ้อนและใช้เวลาพัฒนาพอสมควร จึงถูกจัดไว้สำหรับเฟสถัดไป