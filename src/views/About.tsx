
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

const TEAM_MEMBERS = [
    {
        name: "Mariana Estrada Velásquez",
        role: "Responsable — Facultad de Arquitectura y Artes (UACh)",
        description: "Arquitecta y magíster especializada en planificación regional y diseño urbano sostenible, Mariana ha dedicado su trayectoria a investigar cómo los entornos construidos influyen en el bienestar, la movilidad y la vida cotidiana de las comunidades. Su trabajo combina docencia, investigación aplicada y colaboración con instituciones públicas, explorando temas como espacio público, caminabilidad, perspectiva de género en la ciudad y sostenibilidad territorial. Su enfoque integra análisis urbano, metodologías participativas y diseño para el buen vivir, aportando una mirada sensible y rigurosa a la transformación de los territorios.",
        tags: ["Diseño urbano sostenible", "Inclusividad", "Caminabilidad", "Planificación urbana"],
        image: "/imagenes/mariana estrada.jpg",
        color: "cyan"
    },
    {
        name: "Débora Grandón Valenzuela",
        role: "Responsable — Facultad de Medicina (UACh)",
        description: "Terapeuta ocupacional, investigadora feminista y doctoranda en Estudios Latinoamericanos, Débora centra su trabajo en las relaciones entre cuerpo, género, cuidados y vida cotidiana. Su producción académica aborda temas como sexualidades, feminismos, discapacidad, performance, trabajo de cuidados y derechos humanos, articulando investigación crítica con prácticas comunitarias, artísticas y de extensión. Ha desarrollado archivos, talleres, publicaciones y procesos pedagógicos que cuestionan la normatividad corporal y amplifican voces históricamente marginadas.",
        tags: ["Cuerpo y géneros", "Feminismo", "Cuidado y sexualidad", "Performance y políticas"],
        image: "/imagenes/debora grandon.jpg",
        color: "purple"
    },
    {
        name: "Angela Niebles Gutiérrez",
        role: "Responsable — Facultad de Filosofía y Humanidades (UACh)",
        description: "Psicóloga, magíster en Desarrollo Humano y doctora en Educación, Angela ha construido una destacada trayectoria en torno a corporeidad, afectividad, ecofeminismo y saberes indígenas. Su trabajo vincula educación, cuerpo y territorio desde perspectivas biocéntricas y críticas, integrando experiencias con comunidades mapuche y ẽbẽra eyábida. Su investigación propone nuevas formas de habitar lo educativo a través de la ecoafectividad, el movimiento y el diálogo con cosmologías ancestrales.",
        tags: ["Corporeidad", "Ecofeminismo", "Saberes indígenas", "Educación biocéntrica"],
        image: "/imagenes/angela niebles.jpg",
        color: "cyan"
    },
    {
        name: "Karina Miranda Cerón",
        role: "Responsable — Prorrectoría (UACh)",
        description: "Abogada y diplomada en derechos humanos y género, Karina se ha dedicado a impulsar políticas universitarias para la equidad, la inclusión y la prevención de violencias. Ha liderado proyectos institucionales, comisiones y programas vinculados a género, diversidad, derechos humanos y cultura organizacional. Con una extensa trayectoria en activismo feminista, formación comunitaria y trabajo territorial, combina su formación jurídica con una fuerte vocación de incidencia social.",
        tags: ["Equidad de género", "Derechos humanos", "Incidencia social", "Educación no sexista"],
        image: "/imagenes/karina miranda.jpg",
        color: "purple"
    },
    {
        name: "Karen Carrera de la Barra",
        role: "Equipo ejecutor — Facultad de Arquitectura y Artes (UACh)",
        description: "Diseñadora gráfica y magíster en investigación en arte y diseño, Karen trabaja en la intersección entre comunicación visual, imagen, género y cultura contemporánea. Desde la docencia y la investigación explora el rol de las imágenes en la construcción de discursos, identidades y narrativas sociales. Ha guiado proyectos sobre corporalidad, representación visual and diversidades, y participa activamente en congresos y espacios de creación.",
        tags: ["Comunicación visual", "Cultura visual", "Diseño crítico", "Imagen y visualidad"],
        image: "/imagenes/karen carrera.jpg",
        color: "cyan"
    },
    {
        name: "Carolina Belmar Rojas",
        role: "Equipo ejecutor — Facultad de Filosofía y Humanidades (UACh)",
        description: "Educadora y magíster en políticas y gestión educativa, Carolina ha dedicado su trayectoria a fortalecer prácticas pedagógicas centradas en el cuerpo, el bienestar y la experiencia sensible del aprendizaje. Con formación en psicomotricidad y amplia participación en congresos internacionales, ha impulsado iniciativas innovadoras en educación física, motricidad infantil y ecopedagogía.",
        tags: ["Bienestar y corporeidad", "Psicomotricidad", "Trabajo territorial", "Pedagogías del cuerpo"],
        image: "/imagenes/carolina belmar.jpg",
        color: "purple"
    },
    {
        name: "Tania Espinoza Márquez",
        role: "Equipo ejecutor — Doctoranda.",
        description: "Socióloga y doctoranda en estudios latinoamericanos, Tania se especializa en migración, género y racismo, con un marcado interés en las experiencias de mujeres haitianas en el sur de Chile. Ha realizado investigación en proyectos nacionales y docencia en diversas universidades, aportando una mirada crítica y situada sobre interculturalidad and desigualdades.",
        tags: ["Género y racismo", "Interculturalidad", "Metodologías", "Docencia universitaria"],
        image: "/imagenes/tania espinoza.jpg",
        color: "cyan"
    },
    {
        name: "Clarena Rodríguez Jaramillo",
        role: "Coordinadora.",
        description: "Trabajadora social con especialización en cooperación y gestión de proyectos. Experiencia en el diseño e implementación de intervenciones territoriales inter-transdisciplinarias con enfoques de género e interculturalidad. Alta capacidad de organización, coordinación y comunicación, excelente capacidad analítica y muy buena disposición para el trabajo en equipo.",
        tags: ["Desarrollo sostenible", "Feminismo", "Gestión social", "Gobernanzas locales"],
        image: "/imagenes/Clarena Rodriguez.jpg",
        color: "purple"
    }
];

const ProfileRow: React.FC<{ member: typeof TEAM_MEMBERS[0]; index: number }> = ({ member, index }) => {
    const isLeft = index % 2 === 0;
    const isCyan = member.color === 'cyan';
    const tagBg = isCyan ? 'bg-[#702d8d]' : 'bg-[#5cc8d7]';
    const cardBg = isCyan ? 'bg-[#5cc8d7]' : 'bg-[#702d8d]';

    const ProfileImage = (
        <div className="relative w-full max-w-[420px] aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden group shadow-md shrink-0">
            <img
                src={member.image}
                alt={member.name}
                className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute bottom-0 left-0 w-full p-6 md:p-8 pt-10 md:pt-14 ${cardBg} text-white team-bubble`}>
                <h4 className="text-xl md:text-2xl font-black leading-tight mb-1">{member.name}</h4>
                <p className="text-sm md:text-base opacity-90 font-medium leading-tight">{member.role}</p>
            </div>
        </div>
    );

    const ProfileInfo = (
        <div className="flex flex-col gap-8 flex-1">
            <p className="text-[#555] text-lg md:text-xl leading-relaxed font-medium">
                {member.description}
            </p>
            <div className="flex flex-wrap gap-3">
                {member.tags.map(tag => (
                    <span key={tag} className={`${tagBg} text-white px-6 py-2 rounded-2xl text-sm font-bold shadow-sm transition-transform hover:scale-105`}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-40 relative">
            {isLeft ? (
                <>
                    {ProfileImage}
                    {ProfileInfo}
                </>
            ) : (
                <>
                    <div className="order-2 lg:order-1">
                        {ProfileInfo}
                    </div>
                    <div className="order-1 lg:order-2">
                        {ProfileImage}
                    </div>
                </>
            )}
        </div>
    );
};

const About: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden bg-[#f8f8f8]">
            <div className="absolute top-0 right-0 translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
            </div>
            <div className="absolute top-[25%] left-0 -translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
            </div>
            <div className="absolute top-[50%] right-0 translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
            </div>
            <div className="absolute top-[75%] left-0 -translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
            </div>

            <div className="max-w-7xl w-full px-4 md:px-12 flex flex-col relative z-10 py-8 md:py-16">
                <div className="w-full flex flex-col">
                    {TEAM_MEMBERS.map((member, idx) => (
                        <ProfileRow key={member.name} member={member} index={idx} />
                    ))}
                </div>
                <Footer />
            </div>

            <div className="w-full relative z-20">
                <BackButton onClick={() => navigate('/')} />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .team-bubble {
          clip-path: polygon(
            0% 25px, 
            15px 25px,
            65% 25px, 
            85% 0%, 
            85% 25px,
            100% 25px, 
            100% 100%, 
            0% 100%
          );
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
        }
        @media (max-width: 768px) {
          .team-bubble {
            clip-path: polygon(
              0% 20px, 
              60% 20px, 
              80% 0%, 
              80% 20px, 
              100% 20px, 
              100% 100%, 
              0% 100%
            );
          }
        }
      `}} />
        </div>
    );
};

export default About;
