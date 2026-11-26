import type { ProductItem } from './types';

export const PRODUCTS: ProductItem[] = [
  {
    id: 'vibe-gif-studio',
    title: 'Vibe GIF Song Studio',
    year: '2026',
    category: 'creative',
    featured: true,
    visible: true,
    role: {
      vi: 'Tác giả độc lập',
      en: 'Solo creator',
    },
    summary: {
      vi: 'Đồng bộ GIF theo nhạc Windows qua WASAPI FFT và ONNX.',
      en: 'Syncs GIFs to Windows audio via WASAPI FFT and ONNX.',
    },
    problem: {
      vi: 'Các trình trực quan hóa âm thanh thông thường chỉ nảy theo âm lượng tổng hoặc BPM cố định, thiếu cảm giác khớp nhịp từng nhạc cụ và đòi hỏi cấu hình driver ảo phức tạp.',
      en: 'Typical audio visualizers only bounce to raw loudness or fixed BPM and often require virtual audio cable routing.',
    },
    solution: {
      vi: 'Xây dựng bộ bắt âm thanh nền Windows WASAPI Loopback bằng C# .NET thực thi FFT 1024 điểm, kết hợp dịch vụ AI Essentia Discogs-EffNet ONNX tách 5 vai trò nhạc cụ để điều khiển vật lý lò xo 60 FPS cho GIF.',
      en: 'Built a lightweight C# .NET Windows WASAPI loopback listener running 1024-point FFT alongside an Essentia Discogs-EffNet ONNX pipeline separating 5 musical roles to drive 60 FPS spring-damper GIF motion.',
    },
    highlights: [
      {
        vi: 'Bắt âm thanh hệ thống trực tiếp không cần cài đặt driver ảo trung gian.',
        en: 'Captures live Windows system audio directly without virtual audio cables.',
      },
      {
        vi: 'Phân tách nhịp trống Kick, Bass, Harmony, Melody và Hi-Hat thời gian thực.',
        en: 'Separates Kick, Bass, Harmony, Melody, and Hi-Hat cues in real time.',
      },
      {
        vi: 'Đóng gói cả bản VS Code Extension và Windows Desktop Studio kèm Beat Trainer.',
        en: 'Shipped as both a VS Code Extension and a Windows Desktop Studio with Beat Trainer.',
      },
    ],
    stack: ['TypeScript', 'C# .NET', 'ONNX', 'WASAPI', 'Canvas'],
    architectureSpecs: [
      {
        label: { vi: 'Thu âm hệ thống', en: 'Audio capture' },
        value: { vi: 'Windows WASAPI Loopback (C# .NET)', en: 'Windows WASAPI Loopback (C# .NET)' },
      },
      {
        label: { vi: 'Xử lý tín hiệu', en: 'DSP pipeline' },
        value: { vi: '1024-point FFT, Onset & BPM', en: '1024-point FFT, Onset and BPM' },
      },
      {
        label: { vi: 'Phân tích AI', en: 'AI model' },
        value: { vi: 'Essentia Discogs-EffNet ONNX', en: 'Essentia Discogs-EffNet ONNX' },
      },
      {
        label: { vi: 'Đóng gói', en: 'Distribution' },
        value: { vi: 'VS Code Extension & Desktop Studio', en: 'VS Code Extension and Desktop Studio' },
      },
    ],
    image: '/images/products/vibe-gif-studio.png',
    imageWidth: 1380,
    imageHeight: 880,
    imageAlt: {
      vi: 'Giao diện Vibe GIF Studio hiển thị sân khấu GIF, đồ thị FFT và phân tích vai trò nhạc cụ ONNX',
      en: 'Vibe GIF Studio interface showing live GIF stage, FFT spectrum analyzer, and ONNX musical role telemetry',
    },
  },
  {
    id: 'notgungun-ultimatum',
    title: 'NotGunGun Pack: Ultimatum',
    year: '2025',
    category: 'creative',
    featured: true,
    visible: true,
    has3DViewer: true,
    role: {
      vi: 'Thiết kế mô hình 3D & Gói mod TaCZ',
      en: '3D modeler and TaCZ pack author',
    },
    summary: {
      vi: 'Mô hình vũ khí 3D Bedrock cho Minecraft TaCZ kèm âm thanh OGG tùy chỉnh.',
      en: 'Bedrock 3D gunpack for Minecraft TaCZ with pixel UV textures and custom OGG sound design.',
    },
    problem: {
      vi: 'Tạo một mẫu shotgun năng lượng nguyên khối đậm chất pixel-art hoạt động trọn vẹn trong mod TaCZ, đầy đủ khớp xương chuyển động, cân bằng thông số và hiệu ứng âm thanh riêng.',
      en: 'Crafting a cohesive pixel-art energy shotgun pack for Minecraft TaCZ requiring accurate bone pivots, balanced ballistics JSON, and bespoke sound effects.',
    },
    solution: {
      vi: 'Dựng mô hình Bedrock 63 xương (ul_geo.json), vẽ UV texture 128x128 sắc nét, biên soạn animation 190 KB cùng bộ âm thanh OGG (bắn, kiểm tra súng, nạp đạn) và cấu hình chế tạo.',
      en: 'Modeled a 63-bone Bedrock geometry (ul_geo.json), painted crisp pixel UV maps, authored 190 KB of keyframe animations, and mixed custom OGG audio cues for shot, inspect, and reload.',
    },
    highlights: [
      {
        vi: 'Xem và xoay mô hình 3D thật (ul_geo.json + ul.png) trực tiếp trên trình duyệt qua WebGL.',
        en: 'Interactive WebGL 3D inspection of the real ul_geo.json geometry and ul.png pixel UV map.',
      },
      {
        vi: 'Nghe trực tiếp bộ âm thanh thật trích xuất từ gói mod: Shot, Inspect và Reload.',
        en: 'Built-in audio preview for real extracted OGG effects: Shot, Inspect, and Reload.',
      },
      {
        vi: 'Đóng gói chuẩn Minecraft Timeless and Classics Zero (TaCZ) kèm đạn u12g và công thức chế tạo.',
        en: 'Packaged to Minecraft TaCZ standards with custom u12g shells, HUD icon, and crafting recipe.',
      },
    ],
    stack: ['Blockbench', 'Bedrock Geo 3D', 'Three.js', 'Minecraft TaCZ', 'OGG Audio'],
    architectureSpecs: [
      {
        label: { vi: 'Định dạng 3D', en: '3D geometry' },
        value: { vi: 'Bedrock 1.21.0 (63 bones, ul_geo.json)', en: 'Bedrock 1.21.0 (63 bones, ul_geo.json)' },
      },
      {
        label: { vi: 'Texture & HUD', en: 'Textures' },
        value: { vi: 'Pixel UV Map + ul_hud.png', en: 'Pixel UV Map and ul_hud.png' },
      },
      {
        label: { vi: 'Âm thanh tùy chỉnh', en: 'Custom SFX' },
        value: { vi: 'Shot, Inspect, Reload, Draw, Kill (.ogg)', en: 'Shot, Inspect, Reload, Draw, Kill (.ogg)' },
      },
      {
        label: { vi: 'Thông số trong game', en: 'Gameplay spec' },
        value: { vi: '350 RPM · 24 pellets · Open Bolt', en: '350 RPM · 24 pellets · Open Bolt' },
      },
    ],
    image: '/images/products/notgungun-ultimatum.jpg',
    imageWidth: 1024,
    imageHeight: 565,
    imageAlt: {
      vi: 'Mô hình 3D NotGunGun Ultimatum với dải năng lượng lam phát sáng trên nền lưới Blockbench',
      en: 'NotGunGun Ultimatum 3D voxel model featuring cyan plasma vents on Blockbench grid',
    },
    audioSamples: [
      { id: 'shot', label: { vi: 'Tiếng bắn (Shot)', en: 'Shot SFX' }, src: '/audio/notgungun/shot.ogg' },
      { id: 'inspect', label: { vi: 'Kiểm tra (Inspect)', en: 'Inspect SFX' }, src: '/audio/notgungun/inspect.ogg' },
      { id: 'reload', label: { vi: 'Nạp đạn (Reload)', en: 'Reload SFX' }, src: '/audio/notgungun/reload.ogg' },
    ],
  },
  {
    id: 'examguard-ai',
    title: 'ExamGuard AI',
    year: '2026',
    category: 'ai',
    featured: true,
    visible: true,
    role: {
      vi: 'Tác giả Đồ án Tốt nghiệp',
      en: 'Graduation thesis author',
    },
    summary: {
      vi: 'Thi trực tuyến Zero-Trust tích hợp Face KYC và giám sát 3D.',
      en: 'Zero-Trust online exam platform with Face KYC and 3D proctoring.',
    },
    problem: {
      vi: 'Tổ chức thi trực tuyến trên phòng máy trường đại học cần xác thực sinh viên và giám sát gian lận liên tục nhưng không phụ thuộc GPU đắt đỏ, đồng thời tránh báo động nhầm khi cán bộ đi kiểm tra bàn.',
      en: 'University computer lab exams require reliable biometric verification and proctoring on CPU-only hardware while eliminating false alarms when human proctors inspect desks.',
    },
    solution: {
      vi: 'Thiết kế kiến trúc đa dịch vụ kết hợp React 19, Express/Socket.IO, Python Flask và FastAPI Face AI (YuNet, MiniFASNet Liveness, ArcFace 512-D), cơ chế Staff Biometric Whitelist và lưu trữ kép MySQL + MongoDB.',
      en: 'Architected a multi-service platform combining React 19, Express/Socket.IO, Python Flask, and FastAPI Face AI (YuNet, MiniFASNet Liveness, ArcFace 512-D), Staff Biometric Whitelist, and MySQL plus MongoDB.',
    },
    highlights: [
      {
        vi: 'Xác thực khuôn mặt chống giả mạo Liveness và trích xuất vector ArcFace 512 chiều chạy trên CPU.',
        en: 'CPU-first face anti-spoofing (MiniFASNet) and 512-D ArcFace identity verification.',
      },
      {
        vi: 'Bản đồ phòng thi số hóa 2D/3D đồng bộ trạng thái thí sinh theo thời gian thực qua Socket.IO.',
        en: 'Real-time 2D/3D exam room Digital Twin synchronized over Socket.IO.',
      },
      {
        vi: 'Đồng bộ hai chiều dữ liệu đào tạo MySQL (13 bảng ACID) và ngân hàng đề, vector MongoDB.',
        en: 'Bidirectional sync between MySQL academic records and MongoDB exam and biometric documents.',
      },
    ],
    stack: ['React 19', 'TypeScript', 'Python Flask', 'FastAPI', 'MySQL', 'MongoDB'],
    architectureSpecs: [
      {
        label: { vi: 'Giao diện', en: 'Frontend' },
        value: { vi: 'React 19, TypeScript, Tailwind CSS v4', en: 'React 19, TypeScript, Tailwind CSS v4' },
      },
      {
        label: { vi: 'Thị giác AI', en: 'Face AI engine' },
        value: { vi: 'YuNet, MiniFASNet, ArcFace 512-D', en: 'YuNet, MiniFASNet, ArcFace 512-D' },
      },
      {
        label: { vi: 'Dịch vụ nền', en: 'Backend services' },
        value: { vi: 'Express Socket.IO, Flask, FastAPI', en: 'Express Socket.IO, Flask, FastAPI' },
      },
      {
        label: { vi: 'Cơ sở dữ liệu', en: 'Persistence' },
        value: { vi: 'MySQL 8.0 và MongoDB', en: 'MySQL 8.0 and MongoDB' },
      },
    ],
    imageAlt: {
      vi: 'Sơ đồ kiến trúc hệ thống ExamGuard AI',
      en: 'ExamGuard AI system architecture overview',
    },
    repoUrl: 'https://github.com/ShadyFyrix/K23CNT3-LucVanSon-2310900087-DATN',
  },
  {
    id: 'ma-at-zessou',
    title: 'Ma-at-Zessou',
    year: '2026',
    category: 'creative',
    visible: true,
    role: {
      vi: 'Phát triển game độc lập',
      en: 'Solo game developer',
    },
    summary: {
      vi: 'Tựa game 2D kết hợp hành động nhịp điệu và đi cảnh (Action-Rhythm Platformer).',
      en: 'Solo-developed 2D hybrid action-rhythm and platformer game.',
    },
    problem: {
      vi: 'Kết hợp phản xạ đi cảnh 2D truyền thống với nhịp điệu âm nhạc buộc người chơi hành động theo tiết tấu.',
      en: 'Combining crisp 2D platforming physics with musical rhythm mechanics that reward timed combat inputs.',
    },
    solution: {
      vi: 'Tự thiết kế vòng lặp gameplay kết hợp hành động và nhịp điệu, công bố mã nguồn trực tiếp trên GitHub.',
      en: 'Designed and developed the hybrid action-rhythm gameplay loop as an independent solo repository on GitHub.',
    },
    highlights: [
      {
        vi: 'Dự án phát triển độc lập kết hợp cơ chế chiến đấu hành động và đồng bộ nhịp điệu.',
        en: 'Solo independent project blending rhythm synchronization with 2D platformer combat.',
      },
    ],
    stack: ['Game Dev', 'Action-Rhythm', '2D Platformer'],
    architectureSpecs: [
      {
        label: { vi: 'Thể loại', en: 'Genre' },
        value: { vi: 'Hybrid Action-Rhythm & 2D Platformer', en: 'Hybrid Action-Rhythm & 2D Platformer' },
      },
      {
        label: { vi: 'Vai trò', en: 'Role' },
        value: { vi: 'Solo Developer', en: 'Solo Developer' },
      },
    ],
    imageAlt: {
      vi: 'Dự án game Ma-at-Zessou trên GitHub',
      en: 'Ma-at-Zessou 2D game repository',
    },
    repoUrl: 'https://github.com/ShadyFyrix/Ma-at-Zessou',
  },
  {
    id: 'qlcsvc-ai',
    title: 'QLCSVC-AI',
    year: '2026',
    category: 'ai',
    visible: true,
    role: {
      vi: 'Cộng tác viên phụ trách phân hệ AI',
      en: 'AI module contributor',
    },
    summary: {
      vi: 'Quản lý cơ sở vật chất dùng Gemini Vision và chống tráo QR.',
      en: 'Facility management using Gemini Vision and QR anti-swap verification.',
    },
    problem: {
      vi: 'Kiểm kê thiết bị phòng học thủ công dễ xảy ra tình trạng dán tráo nhãn QR giữa thiết bị mới và thiết bị hỏng, gây sai lệch trạng thái tài sản.',
      en: 'Manual campus asset audits are vulnerable to swapped QR labels between working and damaged equipment.',
    },
    solution: {
      vi: 'Phát triển cầu nối Flask tích hợp Gemini Vision vào hệ thống Spring Boot để nhận diện model thiết bị qua ảnh chụp, đối chiếu ảnh thực tế với hồ sơ DB và hỗ trợ tìm kiếm giọng nói.',
      en: 'Built a Flask microservice connecting Gemini Vision with a Spring Boot core to identify device models from photos, cross-check physical visuals against QR records, and support voice lookup.',
    },
    highlights: [
      {
        vi: 'Nhận diện hãng, model và mức độ hư hỏng thiết bị trực tiếp từ ảnh chụp.',
        en: 'Identifies brand, model, and physical damage severity directly from camera photos.',
      },
      {
        vi: 'Đối chiếu chéo ảnh thực tế và thông tin QR để cảnh báo hành vi tráo nhãn.',
        en: 'Cross-verifies photographed hardware against QR metadata to flag label swaps.',
      },
      {
        vi: 'Đóng góp 15 commits, 17 tệp mã nguồn và báo cáo chuyển giao phân hệ AI.',
        en: 'Contributed 15 commits across 17 files and authored the AI handoff specification.',
      },
    ],
    stack: ['Python Flask', 'Gemini Vision', 'Spring Boot', 'SQL'],
    architectureSpecs: [
      {
        label: { vi: 'Mô hình AI', en: 'Vision AI' },
        value: { vi: 'Gemini Vision API', en: 'Gemini Vision API' },
      },
      {
        label: { vi: 'Dịch vụ cầu nối', en: 'Bridge service' },
        value: { vi: 'Python Flask', en: 'Python Flask' },
      },
      {
        label: { vi: 'Hệ thống lõi', en: 'Core backend' },
        value: { vi: 'Java Spring Boot và SQL', en: 'Java Spring Boot and SQL' },
      },
    ],
    imageAlt: {
      vi: 'Minh họa phân hệ QLCSVC-AI',
      en: 'QLCSVC-AI facility management overview',
    },
    repoUrl: 'https://github.com/TranTienAnh2012/NGIENCUUKHOAHOC.QLCSVC-AI',
  },
  {
    id: 'university-face-system',
    title: 'University Face System',
    year: '2026',
    category: 'systems',
    visible: true,
    role: {
      vi: 'Nhà phát triển chính',
      en: 'Lead developer',
    },
    summary: {
      vi: 'Điểm danh và giám sát thi dùng DeepFace, MTCNN và ArcFace.',
      en: 'Student attendance and proctoring via DeepFace, MTCNN, and ArcFace.',
    },
    problem: {
      vi: 'Quy trình điểm danh thủ công mất nhiều thời gian đầu giờ và khó tổng hợp lịch sử chuyên cần xuyên suốt nhiều học phần.',
      en: 'Manual classroom roll-call consumes lecture time and complicates attendance tracking across semesters.',
    },
    solution: {
      vi: 'Xây dựng ứng dụng web React + Node.js Express kết nối dịch vụ DeepFace/MTCNN/ArcFace để nhận diện khuôn mặt qua camera và đồng bộ dữ liệu điểm danh vào MySQL.',
      en: 'Engineered a React and Node.js Express web application backed by DeepFace, MTCNN, and ArcFace recognition pipelines synced with MySQL.',
    },
    highlights: [
      {
        vi: 'Tách rõ 3 dịch vụ Giao diện, API nghiệp vụ và AI nhận diện, khởi chạy đồng bộ qua script.',
        en: 'Separated frontend, business API, and recognition engine with unified startup scripts.',
      },
      {
        vi: 'Hỗ trợ cả luồng điểm danh lớp học lẫn giám sát thí sinh trong phòng thi.',
        en: 'Supports both routine classroom attendance and exam session monitoring.',
      },
    ],
    stack: ['Python', 'DeepFace', 'React', 'Node.js', 'MySQL'],
    architectureSpecs: [
      {
        label: { vi: 'Nhận diện', en: 'Recognition' },
        value: { vi: 'DeepFace, MTCNN, ArcFace', en: 'DeepFace, MTCNN, ArcFace' },
      },
      {
        label: { vi: 'Ứng dụng web', en: 'Web app' },
        value: { vi: 'React Vite và Node.js Express', en: 'React Vite and Node.js Express' },
      },
      {
        label: { vi: 'Cơ sở dữ liệu', en: 'Database' },
        value: { vi: 'MySQL', en: 'MySQL' },
      },
    ],
    imageAlt: {
      vi: 'Hệ thống điểm danh University Face System',
      en: 'University Face System overview',
    },
    repoUrl: 'https://github.com/ShadyFyrix/TTTN-UngDungDeepLearning',
  },
  {
    id: 'face-i-can-scan',
    title: 'Face I Can Scan',
    year: '2026',
    category: 'ai',
    visible: true,
    role: {
      vi: 'Nhà phát triển ứng dụng',
      en: 'Application developer',
    },
    summary: {
      vi: 'Phân tích 68 điểm mốc, 7 cảm xúc trên WebRTC và Flutter.',
      en: '68-landmark and 7-emotion inference across WebRTC and Flutter.',
    },
    problem: {
      vi: 'Cần một công cụ gọn nhẹ cho phép thử nghiệm trích xuất đặc trưng khuôn mặt thời gian thực trực tiếp trên trình duyệt lẫn thiết bị di động.',
      en: 'Needed a portable testbed for real-time facial landmark and attribute inference across desktop browsers and mobile.',
    },
    solution: {
      vi: 'Phát triển song song web client WebRTC theo dõi FPS trực tiếp và ứng dụng Flutter kết nối API FastAPI chạy InsightFace và ONNX Runtime.',
      en: 'Built a WebRTC browser client with live FPS telemetry alongside a Flutter client backed by FastAPI, InsightFace, and ONNX Runtime.',
    },
    highlights: [
      {
        vi: 'Vẽ bounding box cùng 68 điểm mốc khuôn mặt và theo dõi FPS thời gian thực.',
        en: 'Renders bounding boxes, 68 facial landmarks, and live frame-rate counters.',
      },
      {
        vi: 'Hỗ trợ chuyển đổi camera trước/sau trên Web và ứng dụng di động Flutter.',
        en: 'Supports front and rear camera switching across Web and Flutter clients.',
      },
    ],
    stack: ['React', 'Flutter', 'FastAPI', 'InsightFace', 'ONNX'],
    architectureSpecs: [
      {
        label: { vi: 'Đa nền tảng', en: 'Clients' },
        value: { vi: 'WebRTC Browser và Flutter', en: 'WebRTC Browser and Flutter' },
      },
      {
        label: { vi: 'Suy luận AI', en: 'Inference' },
        value: { vi: 'FastAPI, InsightFace, ONNX Runtime', en: 'FastAPI, InsightFace, ONNX Runtime' },
      },
    ],
    imageAlt: {
      vi: 'Ứng dụng Face I Can Scan',
      en: 'Face I Can Scan overview',
    },
  },
];
