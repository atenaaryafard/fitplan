

/* =====================================================
   EXERCISE DATABASE
===================================================== */

const exercises = [


      { name: "پرس سینه هالتر", muscle: "سینه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0045.gif" },
      { name: "پرس سینه دمبل", muscle: "سینه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0289.gif" },
      { name: "پرس بالا سینه دمبل", muscle: "بالاسینه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0314.gif" },
      { name: "پرس زیر سینه", muscle: "زیرسینه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0033.gif" },
      { name: "فلای دمبل", muscle: "سینه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0319.gif" },
      { name: "فلای سیم‌کش", muscle: "سینه", gif: "https://static.exercisedb.dev/media/xLYSdtg.gif" },
      { name: "شنا", muscle: "سینه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0662.gif" },
      { name: "شنا دست جمع", muscle: "سینه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/2398.gif" },
      { name: "قفسه سینه دمبل", muscle: "سینه", gif: "https://morabihamrah.com/wp-content/uploads/2023/07/Dumbbell-Fly123.gif" },
      
      { name: "بارفیکس", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0652.gif" },
      { name: "بارفیکس دست برعکس", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/uploads/exercises/1080/chin-up-1326.gif" },
      { name: "لت سیم‌کش", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/uploads/2023/09/wide-grip-lat-pulldown.gif" },
      { name: "قایقی سیم‌کش", muscle: "پشت میانی", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0861.gif" },
      { name: "زیربغل هالتر خم", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/uploads/2013/12/barbell-bent-over-row.gif" },
      { name: "زیربغل دمبل تک‌دست", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0292.gif" },
      { name: "تی‌بار", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/1349.gif" },
      { name: "زیربغل سیم‌کش تک‌دست", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0193.gif" },
      { name: "پول‌اور سیم‌کش", muscle: "زیربغل", gif: "https://i.pinimg.com/originals/28/41/d4/2841d494a3adb9366896e14cc0291254.gif" },
      { name: "پول‌اور دمبل", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0375.gif" },
      { name: "زیربغل دستگاه H", muscle: "زیربغل", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/1350.gif" },
      { name: "زیربغل دمبل خم H", muscle: "زیربغل", gif: "https://routination.com/wp-content/uploads/2023/12/exercises-back85.gif" },
      
      { name: "پرس سرشانه هالتر", muscle: "سرشانه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/1457.gif" },
      { name: "پرس سرشانه دمبل", muscle: "سرشانه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0426.gif" },
      { name: "پرس آرنولدی", muscle: "سرشانه", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif" },
      { name: "نشر جانب دمبل", muscle: "سرشانه", gif: "https://static.exercisedb.dev/media/DsgkuIt.gif" },
      { name: "نشر جانب سیم‌کش", muscle: "سرشانه", gif: "https://i.pinimg.com/originals/10/27/64/1027649f1835484972c145d80dce5d7c.gif" },
      { name: " نشر جلو دمبل", muscle: "سرشانه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0310.gif" },
      { name: "نشر خم دمبل", muscle: "سرشانه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0378.gif" },
      { name: "فیس پول ", muscle: "سرشانه", gif: "https://i.pinimg.com/originals/8b/7b/24/8b7b24d4b18312191cd4ab21f8a0a66e.gif" },
      { name: "کول هالتر", muscle: "کول", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0121.gif" },
      { name: "پرس سرشانه دستگاه", muscle: "سرشانه", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/2318.gif" },
      { name: "سرشانه سیمکش دست صاف", muscle: "سرشانه", gif: "https://gymvisual.com/img/p/2/8/3/3/5/28335.gif" },
      
      { name: "جلو بازو هالتر", muscle: "جلو بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0031.gif" },
      { name: "جلو بازو دمبل", muscle: "جلو بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0285.gif" },
      { name: "جلو بازو چکشی", muscle: "جلو بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0312.gif" },
      { name: "جلو بازو لاری", muscle: "جلو بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/2294.gif" },
      { name: "جلو بازو تمرکزی", muscle: "جلو بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0297.gif" },
      { name: "جلو بازو سیم‌کش", muscle: "جلو بازو", gif: "https://fitnessvolt.com/wp-content/uploads/exercises/1080/cable-drag-curl-1632.gif" },
      { name: "جلو بازو هالتر EZ", muscle: "جلو بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0451.gif" },
      { name: "جلو بازو اسپایدر", muscle: "جلو بازو", gif: "https://fitliferegime.com/wp-content/uploads/2023/08/Dumbbell-Spider-Curl.gif" },
      
      { name: "پشت بازو سیم‌کش", muscle: "پشت بازو", gif: "https://i.pinimg.com/originals/cd/07/7e/cd077ebb5a33aedd405f082c1494189a.gif" },
      { name: "پشت بازو طناب", muscle: "پشت بازو", gif: "https://i.pinimg.com/originals/c3/02/93/c30293cae668f6c03697863b6aced559.gif" },
      { name: "پشت بازو بالای سر", muscle: "پشت بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/1722.gif" },
      { name: "پلاور دمبل", muscle: "پشت بازو", gif: "https://fa.pelank.com/wp-content/uploads/2026/07/Dumbbell-Triceps-Extension.gif" },
      { name: "پشت بازو خوابیده دمبل", muscle: "پشت بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0351.gif" },
      { name: "دیپ پشت بازو", muscle: "پشت بازو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/1399.gif" },
      { name: "پشت بازو بالای سر سیم‌کش", muscle: "پشت بازو", gif: "https://fa.pelank.com/wp-content/uploads/2026/07/Cable-Rope-Overhead-Triceps-Extension.gif" },
      { name: "فیله دستگاه", muscle: "پشت میانی", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/hyperextension.gif" },
      { name: "فیله دستگاه با وزنه", muscle: "پشت میانی", gif: "https://fitnessia.ir/wp-content/uploads/2023/09/%D9%81%DB%8C%D9%84%D9%87-%DA%A9%D9%85%D8%B1-%D8%AF%D8%B3%D8%AA%DA%AF%D8%A7%D9%87.gif" },

      
      { name: "اسکوات هالتر", muscle: "چهارسر و سرینی", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/1435.gif" },
      { name: "اسکوات جام", muscle: "چهارسر و سرینی", gif: "https://fitnessvolt.com/wp-content/uploads/2020/07/Goblet-Squat.gif" },
      { name: "اسکوات جلو", muscle: "چهارسر ران", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0042.gif" },
      { name: "اسکوات بلغاری", muscle: "چهارسر ران", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Dumbbell-Bulgarian-Split-Squat.gif" },
      { name: " لانج دمبل", muscle: "چهارسر ران", gif: "https://newlife.com.cy/wp-content/uploads/2019/11/11751301-Dumbbell-forward-leaning-lunge_Thighs_360.gif" },
      { name: "لانج راه رفتنی", muscle: "چهارسر ران", gif: "https://fitnessprogramer.com/wp-content/uploads/2023/09/dumbbell-lunges.gif" },
      { name: "لانج معکوس", muscle: " چهارسر ران", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0381.gif" },
      { name: "پرس پا", muscle: "چهارسر ران", gif: "https://burnfit.io/wp-content/uploads/LEG_PRESS-1.gif" },
      { name: "جلو پا دستگاه", muscle: "چهارسر ران", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0585.gif" },
      { name: "پشت پا دستگاه", muscle: "همسترینگ", gif: "https://i.pinimg.com/originals/f1/d2/7e/f1d27e8117903a86e3a5d125fd3bd760.gif" },
      { name: "ددلیفت رومانیایی", muscle: "همسترینگ و سرینی", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif" },
      { name: "ددلیفت", muscle: "همسترینگ و سرینی", gif: "https://fitnessvolt.com/wp-content/uploads/2023/09/barbell-deadlift.gif" },
      { name: "هیپ تراست", muscle: "سرینی", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif" },
      { name: "پل باسن", muscle: "سرینی", gif: "https://i.pinimg.com/originals/d1/90/42/d19042fd33e8e9707d4b8340aaddf61b.gif" },
      { name: "استپ آپ", muscle: "چهارسر و سرینی", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0431.gif" },
      { name: "ساق پا ایستاده", muscle: "ساق", gif: "https://fitnessia.ir/wp-content/uploads/2023/09/%D8%B3%D8%A7%D9%82-%D9%BE%D8%A7-%D8%A7%DB%8C%D8%B3%D8%AA%D8%A7%D8%AF%D9%87-%D9%88%D8%B2%D9%86-%D8%A8%D8%AF%D9%86.gif" },
      { name: "ساق پا نشسته", muscle: "ساق", gif: "https://fitnessia.ir/wp-content/uploads/2023/09/%D8%B3%D8%A7%D9%82-%D9%BE%D8%A7-%D9%86%D8%B4%D8%B3%D8%AA%D9%87-%D8%A8%D8%A7-%D9%88%D8%B2%D9%86%D9%87.gif" },
   
      { name: "کیک‌بک سیم‌کش", muscle: "سرینی", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Cable-Donkey-Kickback.gif" },
      { name: "کیک بک سیمکش از بغل", muscle: "سرینی", gif: "https://storage.novinfitness.com/storage/images/2023-11-10/novinfitness.com_Cable-hip-abduction.jpg" },
      { name: "اسکوات سومو", muscle: "سرینی", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0117.gif" },
      { name: "ددلیفت سومو", muscle: "همسترینگ و سرینی", gif: "https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/DB_SM_DL.gif" },
      { name: "لانج کراس", muscle: "چهارسر ران", gif: "https://liftmanual.com/wp-content/uploads/2023/04/crossover-reverse-lunge.gif" },
      { name: "بغل پا دستگاه", muscle: "سرینی", gif: "https://gymfitclub.ir/public/images/articles/upload/hip-abduction-machine.gif" },
      { name: "اسکات صفحه", muscle: "چهارسر ران", gif: "https://fa.pelank.com/wp-content/uploads/2026/07/Dumbbell-Goblet-Squat.gif" },
      
      { name: "کرانچ", muscle: "شکم", gif: "https://fitnessprogramer.com/wp-content/uploads/2022/07/Full-Crunch-Machine.gif" },
      { name: "شکم خلبانی", muscle: "شکم", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0826.gif" },
      { name: "پلانک", muscle: "شکم", gif: "https://beigi.fit/wp-content/uploads/2024/07/plank1-min.jpg" },
      { name: "پلانک بغل", muscle: "شکم و پهلو", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/3664.gif" },
      { name: "چرخش روسی", muscle: "شکم و پهلو", gif: "https://fitnessvolt.com/wp-content/uploads/2023/09/kettlebell-russian-twist.gif" },
      { name: "کوهنوردی", muscle: "شکم", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0630.gif" },
      { name: "کرانچ سیم‌کش", muscle: "شکم", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0874.gif" },
      
      
      { name: "مچ دمبل", muscle: "ساعد", gif: "https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0397.gif" },
      { name: "مچ معکوس", muscle: "ساعد", gif: "https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/REV_DB_WRIST_CURL.gif" },

];
