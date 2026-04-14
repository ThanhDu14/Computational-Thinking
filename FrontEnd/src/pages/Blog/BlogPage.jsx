import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, User, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BLOG_POSTS = [
  {
    id: 'kham-pha-da-lat',
    title: 'Đà Lạt Tháng Ba: Khi Sương Mù Ôm Trọn Thành Phố Ngàn Hoa',
    excerpt: 'Tháng Ba ở Đà Lạt là một bức tranh thủy mặc sống động — những đồi hoa dã quỳ nở vàng rực, sương sớm còn đọng trên từng tàu lá thông. Một chuyến đi mà bạn sẽ nhớ mãi không quên.',
    content: `Đà Lạt vào tháng Ba khoác lên mình một vẻ đẹp thuần khiết, lãng mạn đến nao lòng. Đó là những buổi sáng tinh mơ khi màn sương trắng còn phủ kín thành phố, những đồi thông rì rào như kể chuyện cổ tích.

## Vì Sao Nên Chọn Tháng Ba?

Tháng Ba là giao thoa của hai mùa — cuối mùa khô và đầu mùa mưa. Khí hậu mát mẻ, trời trong xanh, lý tưởng để đạp xe dạo quanh hồ Xuân Hương hay leo lên đỉnh LangBiang ngắm bình minh.

**Nhiệt độ trung bình:** 15°C - 22°C  
**Lượng mưa:** Thấp, chỉ lác đác vào buổi chiều  
**Đám đông:** Vừa phải, chưa đến mùa hè đông khách  

## Những Điểm Đến Không Thể Bỏ Qua

### 1. Thung Lũng Tình Yêu
Buổi sáng đến đây khi sương còn giăng, cả thung lũng như chìm trong giấc mơ. Nhớ mang theo máy ảnh để ghi lại những khoảnh khắc không thể lặp lại.

### 2. Vườn Hoa Thành Phố  
Hoa mimosa nở rộ vào tháng Ba, tô điểm thêm cho vẻ đẹp thanh lịch của thành phố cao nguyên. Dạo một vòng vào buổi sáng sớm là trải nghiệm không thể phủ nhận.

### 3. Chợ Đêm Đà Lạt
Buổi tối se lạnh, ghé chợ đêm thưởng thức bánh tráng nướng, sữa đậu nành nóng và ngắm phố xá lung linh ánh đèn. Đây là tinh hoa văn hóa ẩm thực không thể thiếu.

## Lời Khuyên Hữu Ích

- Mang theo áo khoác dù đi ban ngày — nhiệt độ buổi tối có thể xuống 12°C
- Thuê xe máy để tự do khám phá, tránh phụ thuộc vào tour
- Thử cà phê trứng tại những quán nhỏ ven đường, hương vị đặc trưng chỉ có ở đây`,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
    author: 'Minh Tuấn',
    readTime: '6 phút đọc',
    date: '28 Tháng 3, 2025',
    category: 'Khám Phá',
    tags: ['Đà Lạt', 'Mùa Xuân', 'Thành Phố Sương Mù'],
  },
  {
    id: 'hoi-an-dem',
    title: 'Hội An Về Đêm: Ánh Đèn Lồng Và Ký Ức Chưa Nguôi',
    excerpt: 'Khi mặt trời lặn xuống, Hội An thức dậy theo một cách hoàn toàn khác. Hàng trăm chiếc đèn lồng lập lòe soi bóng xuống dòng sông Thu Bồn hiền hòa, tạo nên một khung cảnh như chốn thần tiên.',
    content: `Có một Hội An ban ngày yên bình với phố cổ nhuộm màu thời gian, và có một Hội An về đêm thơ mộng đến nghẹt thở khi nghìn ánh đèn lồng xua tan bóng tối.

## Nghi Lễ Thả Đèn Hoa Đăng

Mỗi đêm rằm (ngày 14 và 15 âm lịch), sông Thu Bồn trở thành dòng sông của những ước nguyện. Hàng trăm chiếc đèn hoa đăng được thả xuống dòng nước, mang theo lời cầu chúc bình an và may mắn của du khách từ khắp nơi.

Hãy mua cho mình một chiếc đèn nhỏ, thắp lên ngọn lửa ước muốn và nhẹ nhàng thả xuống dòng sông — đó là khoảnh khắc thiêng liêng mà bạn sẽ mang theo suốt cuộc đời.

## Phố Đi Bộ Về Đêm

Phần lớn phố cổ Hội An được đóng cửa với xe cộ sau 8 giờ tối, biến nơi đây thành thiên đường của người đi bộ. Tiếng nhạc dân gian vang vọng từ những quán cà phê nhỏ, hòa quyện với tiếng cười nói của du khách tạo nên bản giao hưởng đặc trưng của phố Hội.

## Ẩm Thực Đêm Phố Hội

- **Cao Lầu** — Món mỳ trứ danh chỉ có thể ăn đúng vị khi ở Hội An vì nước dùng lấy từ giếng Chăm cổ
- **Bánh Mì Phượng** — Huyền thoại ẩm thực đường phố được Anthony Bourdain từng ca ngợi  
- **Chè Hạt Sen** — Tráng miệng hoàn hảo cho một đêm dạo phố`,
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=1200',
    author: 'Thanh Hà',
    readTime: '5 phút đọc',
    date: '15 Tháng 3, 2025',
    category: 'Văn Hóa',
    tags: ['Hội An', 'Đèn Lồng', 'Phố Cổ'],
  },
  {
    id: 'bien-thanh-hoa',
    title: 'Biển Sầm Sơn: Viên Ngọc Thô Chờ Được Khám Phá',
    excerpt: 'Vượt qua danh tiếng của những resort sang trọng, Sầm Sơn còn ẩn chứa những góc khuất bình dị và chân thật — những ngư dân cần mẫn, những bãi biển hoang sơ và hương vị hải sản tươi nguyên chỉ có ở đây.',
    content: `Sầm Sơn — cái tên gợi lên hình ảnh bãi biển sầm uất với những dãy ô che dày đặc. Nhưng nếu bạn chịu khó bước ra ngoài lối mòn du lịch, nơi này sẽ trao cho bạn những trải nghiệm thực sự đáng giá.

## Buổi Sáng Tại Cảng Cá

Đến cảng cá Sầm Sơn lúc 4-5 giờ sáng khi thuyền đánh cá từ khơi xa trở về. Cảnh tượng hàng nghìn con cá tươi rói được đổ lên bờ, tiếng cả chợ nhộn nhịp và mùi biển mặn mòi — đó là Sầm Sơn mà ít khách du lịch được thấy.

## Hải Sản Tươi Sống Giá Bình Dân

Không cần phải vào nhà hàng sang trọng, chỉ cần ra khu vực chợ hải sản ngay cạnh bãi biển. Tôm, cua, mực, cá thu... tất cả đều tươi sống và giá cả hợp lý đến bất ngờ.

**Gợi ý:** Mang hải sản về nhờ các cô chú trong chợ nướng hoặc hấp — vừa tươi vừa rẻ, lại có không gian ngắm biển.

## Đền Độc Cước — Huyền Thoại Người Khổng Lồ

Trên ghềnh đá nhô ra biển, đền Độc Cước thờ vị thần khổng lồ theo truyền thuyết đã chặt đôi thân mình để bảo vệ ngư dân. Không gian linh thiêng, gió biển mát rượi — một điểm dừng chân đáng để suy ngẫm về những giá trị văn hóa lâu đời.`,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    author: 'Quốc Hùng',
    readTime: '4 phút đọc',
    date: '2 Tháng 3, 2025',
    category: 'Bãi Biển',
    tags: ['Sầm Sơn', 'Thanh Hóa', 'Hải Sản'],
  },
  {
    id: 'kinh-nghiem-balo',
    title: 'Bí Quyết Đóng Gói Ba Lô 7 Ngày Chỉ Với 7kg',
    excerpt: 'Hành lý gọn nhẹ không phải là thiếu thứ — đó là nghệ thuật biết mình cần gì. Người đi nhiều nhất thường mang ít nhất. Đây là bộ bí quyết 7 năm kinh nghiệm du lịch bụi của mình.',
    content: `Sau hơn 50 chuyến đi trong nước và quốc tế, mình đúc kết được một chân lý: hành lý nhẹ = trải nghiệm vui. Đây là toàn bộ bí quyết mình muốn chia sẻ.

## Nguyên Tắc Vàng: K규 Tắc "1/2"

Chuẩn bị xong rồi bỏ ra một nửa. Nghiêm túc đó. Chúng ta thường chuẩn bị dựa trên nỗi sợ "lỡ cần thì sao" thay vì thực tế.

## Quần Áo: Công Thức 3-2-1

- **3 áo thun/áo polo** (có thể phối đa dạng)
- **2 quần** (1 quần dài, 1 quần short/váy)  
- **1 áo khoác nhẹ** (dùng được cả khi lạnh lẫn khi mưa)

Mặc một bộ, một bộ trong ba lô, một bộ đang giặt — bạn sẽ không bao giờ thiếu đồ.

## Vật Dụng Không Thể Thiếu

✅ Bộ sạc đa năng + pin dự phòng  
✅ Khăn microfiber (khô nhanh, gọn nhẹ)  
✅ Túi ziplock (đựng đồ ướt, giữ đồ điện tử khi mưa)  
✅ Thẻ ngân hàng quốc tế (giảm rủi ro mang tiền mặt)  
✅ Ứng dụng bản đồ offline  

## Mẹo Tiết Kiệm Không Gian

Cuộn quần áo thay vì gấp — tiết kiệm đến 30% không gian và không bị nhăn. Nhét đồ lót và tất vào bên trong giày. Đựng các vật dụng nhỏ trong túi rút bên trong ba lô để dễ tìm.`,
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&q=80&w=1200',
    author: 'Linh Chi',
    readTime: '8 phút đọc',
    date: '20 Tháng 2, 2025',
    category: 'Kinh Nghiệm',
    tags: ['Du Lịch Bụi', 'Hành Lý', 'Mẹo Hay'],
  },
];

export { BLOG_POSTS };

const CATEGORY_COLORS = {
  'Khám Phá': 'bg-emerald-100 text-emerald-700',
  'Văn Hóa': 'bg-amber-100 text-amber-700',
  'Bãi Biển': 'bg-sky-100 text-sky-700',
  'Kinh Nghiệm': 'bg-violet-100 text-violet-700',
};

export default function BlogPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="w-full pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-primary-container/30 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4 font-body">
          SmartTravel Journal
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold font-display text-on-surface tracking-tight mb-4">
          Cảm Hứng Du Lịch
        </h1>
        <p className="text-xl text-on-surface-variant font-body max-w-2xl mx-auto">
          Những câu chuyện thật, trải nghiệm thật từ những chuyến đi thật sự đáng nhớ.
        </p>
      </div>

      {/* Featured Post */}
      <div
        onClick={() => navigate(`/blog/${featured.id}`)}
        className="group cursor-pointer relative rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl hover:-translate-y-1 transition-all duration-500"
      >
        <div className="relative h-[480px]">
          <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${CATEGORY_COLORS[featured.category] || 'bg-white/20 text-white'}`}>
            {featured.category}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white mb-4 leading-tight">
            {featured.title}
          </h2>
          <p className="text-white/80 font-body text-base mb-6 max-w-2xl line-clamp-2">{featured.excerpt}</p>
          <div className="flex items-center gap-6 text-white/60 text-sm font-body">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{featured.author}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featured.readTime}</span>
            <span>{featured.date}</span>
          </div>
        </div>
        <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Grid Posts */}
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold font-display text-on-surface">Bài Viết Gần Đây</h2>
        <span className="text-sm text-on-surface-variant font-body">{rest.length} bài viết</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/blog/${post.id}`)}
            className="group cursor-pointer bg-surface rounded-3xl overflow-hidden border border-outline-variant/10 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative h-52 overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${CATEGORY_COLORS[post.category] || 'bg-white/80 text-gray-700'}`}>
                  {post.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold font-display text-on-surface mb-3 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-on-surface-variant font-body text-sm mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-body border-t border-outline-variant/10 pt-4">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
