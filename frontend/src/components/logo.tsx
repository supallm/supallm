import { FC } from "react";

export const Logo: FC<{
  width: number;
  height: number;
  className?: string;
}> = ({ width, height, className }) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 660 660"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="paint0"
          x1="197.673"
          y1="566.379"
          x2="161.305"
          y2="567.53"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3FCE8E" />
          <stop offset="1" stopColor="#3B9B70" />
        </linearGradient>
        <linearGradient
          id="paint1"
          x1="242.457"
          y1="515.15"
          x2="206.089"
          y2="516.302"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3FCE8E" />
          <stop offset="1" stopColor="#3B9B70" />
        </linearGradient>
        <linearGradient
          id="paint2"
          x1="274.355"
          y1="271.893"
          x2="237.987"
          y2="273.045"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3FCE8E" />
          <stop offset="1" stopColor="#3B9B70" />
        </linearGradient>
        <linearGradient
          id="paint3"
          x1="319.14"
          y1="220.665"
          x2="282.772"
          y2="221.817"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3FCE8E" />
          <stop offset="1" stopColor="#3B9B70" />
        </linearGradient>
        <linearGradient
          id="paint4"
          x1="184.785"
          y1="445.613"
          x2="148.395"
          y2="446.351"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3FCE8E" />
          <stop offset="1" stopColor="#3B9B70" />
        </linearGradient>
        <linearGradient
          id="paint5"
          x1="229.57"
          y1="394.384"
          x2="193.181"
          y2="395.122"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3FCE8E" />
          <stop offset="1" stopColor="#3B9B70" />
        </linearGradient>
      </defs>
      <rect
        x="163.888"
        y="439.626"
        width="42.3885"
        height="242.061"
        rx="21.1943"
        transform="rotate(-48.8395 163.888 439.626)"
        fill="url(#paint0)"
      />
      <rect
        x="208.673"
        y="388.398"
        width="42.3885"
        height="242.061"
        rx="21.1943"
        transform="rotate(-48.8395 208.673 388.398)"
        fill="url(#paint1)"
      />
      <rect
        x="240.571"
        y="145.141"
        width="42.3885"
        height="242.061"
        rx="21.1943"
        transform="rotate(-48.8395 240.571 145.141)"
        fill="url(#paint2)"
      />
      <rect
        x="285.355"
        y="93.9131"
        width="42.3885"
        height="242.061"
        rx="21.1943"
        transform="rotate(-48.8395 285.355 93.9131)"
        fill="url(#paint3)"
      />
      <rect
        x="151"
        y="247.6"
        width="42.3885"
        height="378.15"
        rx="21.1943"
        transform="rotate(-48.8395 151 247.6)"
        fill="url(#paint4)"
      />
      <rect
        x="195.786"
        y="196.37"
        width="42.3885"
        height="378.15"
        rx="21.1943"
        transform="rotate(-48.8395 195.786 196.37)"
        fill="url(#paint5)"
      />
    </svg>
  );
};

export default Logo;
