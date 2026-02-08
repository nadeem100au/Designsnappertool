import svgPaths from "./svg-vnp8rbkt06";

function BackgroundMask() {
  return <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[336px] top-1/2" data-name="_Background mask" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\'0 0 336 336\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'><rect x=\'0\' y=\'0\' height=\'100%\' width=\'100%\' fill=\'url(%23grad)\' opacity=\'1\'/><defs><radialGradient id=\'grad\' gradientUnits=\'userSpaceOnUse\' cx=\'0\' cy=\'0\' r=\'10\' gradientTransform=\'matrix(-0.0000017664 16.8 -16.8 -0.0000027601 168 168)\'><stop stop-color=\'rgba(0,0,0,1)\' offset=\'0\'/><stop stop-color=\'rgba(0,0,0,0)\' offset=\'1\'/></radialGradient></defs></svg>')" }} />;
}

function Mask() {
  return (
    <div className="-translate-x-1/2 absolute left-1/2 size-[336px] top-0" data-name="Mask">
      <BackgroundMask />
    </div>
  );
}

function Content() {
  return (
    <div className="-translate-x-1/2 absolute left-1/2 size-[336px] top-0" data-name="Content">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 336 336">
        <g id="Content">
          <circle cx="168" cy="168" id="Line" r="47.5" stroke="var(--stroke-0, #E9EAEB)" />
          <circle cx="168" cy="168" id="Line_2" r="47.5" stroke="var(--stroke-0, #E9EAEB)" />
          <circle cx="168" cy="168" id="Line_3" r="71.5" stroke="var(--stroke-0, #E9EAEB)" />
          <circle cx="168" cy="168" id="Line_4" r="95.5" stroke="var(--stroke-0, #E9EAEB)" />
          <circle cx="168" cy="168" id="Line_5" r="119.5" stroke="var(--stroke-0, #E9EAEB)" />
          <circle cx="168" cy="168" id="Line_6" r="143.5" stroke="var(--stroke-0, #E9EAEB)" />
          <circle cx="168" cy="168" id="Line_7" r="167.5" stroke="var(--stroke-0, #E9EAEB)" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundPatternDecorative() {
  return (
    <div className="absolute left-[-120px] size-[336px] top-[-120px]" data-name="Background pattern decorative">
      <Mask />
      <Content />
    </div>
  );
}

function FeaturedIcon() {
  return <div className="bg-[#f9f5ff] rounded-[9999px] shrink-0 size-[48px]" data-name="Featured icon" />;
}

function TextAndSupportingText() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0 w-full whitespace-pre-wrap" data-name="Text and supporting text">
      <p className="font-['Inter:Semibold',sans-serif] leading-[24px] relative shrink-0 text-[#181d27] text-[16px] w-full">Review permissions</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#535862] text-[14px] w-full">You can preview the permissions for each role</p>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px]">Administrator</p>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-down">
          <path d="M4 6L8 10L12 6" id="Icon" stroke="var(--stroke-0, #A4A7AE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[35px] py-[8px] relative w-full">
          <Content2 />
          <ChevronDown />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d5d7da] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col h-[40px] items-start relative shrink-0 w-[335px]">
      <Input />
    </div>
  );
}

function TabButtonBase() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <div aria-hidden="true" className="absolute border-[#7f56d9] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6941c6] text-[14px]">General</p>
    </div>
  );
}

function TabButtonBase1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Workflow</p>
    </div>
  );
}

function TabButtonBase2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Features</p>
    </div>
  );
}

function TabButtonBase3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Company</p>
    </div>
  );
}

function TabButtonBase4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Addons</p>
    </div>
  );
}

function Tabs() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0" data-name="Tabs">
      <TabButtonBase />
      <TabButtonBase1 />
      <TabButtonBase2 />
      <TabButtonBase3 />
      <TabButtonBase4 />
    </div>
  );
}

function HorizontalTabs() {
  return (
    <div className="absolute content-stretch flex flex-col h-[49px] items-start justify-end left-[-49px] pt-[17px] px-[50px] top-[50px] w-[753px]" data-name="Horizontal tabs">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <Tabs />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[381px]">
      <Frame3 />
      <HorizontalTabs />
    </div>
  );
}

function TextAndSupportingText1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Text and supporting text">
      <p className="font-['Inter:Semibold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#181d27] text-[16px] w-full whitespace-pre-wrap">Candidates</p>
    </div>
  );
}

function TextAndSupportingText2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Text and supporting text">
      <div className="content-stretch flex flex-col items-start px-[21px] relative w-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#7e848c] text-[14px] w-full whitespace-pre-wrap">Collaborate on candidates</p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">Can be invited to review non-hired candidates</p>
    </div>
  );
}

function CheckItemText() {
  return (
    <div className="relative shrink-0 w-full" data-name="Check item text">
      <div className="content-stretch flex gap-[12px] items-start px-[21px] relative w-full">
        <CheckIcon />
        <TextWrap />
      </div>
    </div>
  );
}

function CheckIcon1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">Can add notes and evaluations to candidates that were shared with them</p>
    </div>
  );
}

function CheckItemText1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Check item text">
      <div className="content-stretch flex gap-[12px] items-start px-[21px] relative w-full">
        <CheckIcon1 />
        <TextWrap1 />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[13px] h-[107px] items-start relative shrink-0 w-full">
      <TextAndSupportingText2 />
      <CheckItemText />
      <CheckItemText1 />
    </div>
  );
}

function TextAndSupportingText3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Text and supporting text">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[21px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#7e848c] text-[14px] w-full whitespace-pre-wrap">{` Join hiring teams`}</p>
        </div>
      </div>
    </div>
  );
}

function CheckIcon2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">View the assignments created by others</p>
    </div>
  );
}

function CheckItemText2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Check item text">
      <div className="content-stretch flex gap-[12px] items-start px-[21px] relative w-full">
        <CheckIcon2 />
        <TextWrap2 />
      </div>
    </div>
  );
}

function CheckIcon3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">Send the assignments created by others</p>
    </div>
  );
}

function CheckItemText3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Check item text">
      <div className="content-stretch flex gap-[12px] items-start px-[21px] relative w-full">
        <CheckIcon3 />
        <TextWrap3 />
      </div>
    </div>
  );
}

function CheckIcon4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">Edit assignment scores</p>
    </div>
  );
}

function CheckItemText4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Check item text">
      <div className="content-stretch flex gap-[12px] items-start px-[21px] relative w-full">
        <CheckIcon4 />
        <TextWrap4 />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[13px] h-[147px] items-start relative shrink-0 w-full">
      <TextAndSupportingText3 />
      <CheckItemText2 />
      <CheckItemText3 />
      <CheckItemText4 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#f8f8f8] h-[321px] relative rounded-[15px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[13px] items-start px-[7px] py-[15px] relative size-full">
        <Frame4 />
        <Frame5 />
      </div>
    </div>
  );
}

function TextAndSupportingText4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Text and supporting text">
      <div className="content-stretch flex flex-col items-start px-[15px] relative w-full">
        <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#181d27] text-[14px] w-full whitespace-pre-wrap">Interviews</p>
      </div>
    </div>
  );
}

function CheckIcon5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">View the assignments created by intervue</p>
    </div>
  );
}

function CheckItemText5() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Check item text">
      <CheckIcon5 />
      <TextWrap5 />
    </div>
  );
}

function CheckIcon6() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">Send the assignments created by intervue</p>
    </div>
  );
}

function CheckItemText6() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Check item text">
      <CheckIcon6 />
      <TextWrap6 />
    </div>
  );
}

function CheckIcon7() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">View the assignments created by others</p>
    </div>
  );
}

function CheckItemText7() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Check item text">
      <CheckIcon7 />
      <TextWrap7 />
    </div>
  );
}

function CheckIcon8() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">Send the assignments created by others</p>
    </div>
  );
}

function CheckItemText8() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Check item text">
      <CheckIcon8 />
      <TextWrap8 />
    </div>
  );
}

function CheckIcon9() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p2018a100} fill="var(--fill-0, #DCFAE6)" />
          <path clipRule="evenodd" d={svgPaths.p3695d500} fill="var(--fill-0, #079455)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function TextWrap9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text wrap">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#535862] text-[16px] w-full whitespace-pre-wrap">Edit assignment scores</p>
    </div>
  );
}

function CheckItemText9() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Check item text">
      <CheckIcon9 />
      <TextWrap9 />
    </div>
  );
}

function CheckItems() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Check items">
      <CheckItemText5 />
      <CheckItemText6 />
      <CheckItemText7 />
      <CheckItemText8 />
      <CheckItemText9 />
    </div>
  );
}

function CheckItemsWrap() {
  return (
    <div className="relative shrink-0 w-full" data-name="Check items wrap">
      <div className="content-stretch flex flex-col items-start px-[15px] relative w-full">
        <CheckItems />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#f8f8f8] relative rounded-[15px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[13px] items-start px-[7px] py-[15px] relative w-full">
        <TextAndSupportingText4 />
        <CheckItemsWrap />
      </div>
    </div>
  );
}

function TabButtonBase5() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <div aria-hidden="true" className="absolute border-[#7f56d9] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6941c6] text-[14px]">General</p>
    </div>
  );
}

function TabButtonBase6() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Workflow</p>
    </div>
  );
}

function TabButtonBase7() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Features</p>
    </div>
  );
}

function TabButtonBase8() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Company</p>
    </div>
  );
}

function TabButtonBase9() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center pb-[12px] px-[4px] relative shrink-0" data-name="_Tab button base">
      <p className="font-['Inter:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">Addons</p>
    </div>
  );
}

function Tabs1() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0" data-name="Tabs">
      <TabButtonBase5 />
      <TabButtonBase6 />
      <TabButtonBase7 />
      <TabButtonBase8 />
      <TabButtonBase9 />
    </div>
  );
}

function Content3() {
  return (
    <div className="h-[357px] relative shrink-0 w-full" data-name="Content">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[10px] items-start pb-[32px] pt-[16px] px-[12px] relative size-full">
          <TextAndSupportingText1 />
          <Frame1 />
          <Frame2 />
          <Tabs1 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function InputWithLabel() {
  return (
    <div className="content-stretch flex flex-col gap-[72px] items-start relative shrink-0 w-[992px]" data-name="Input with label">
      <Frame />
      <Content3 />
    </div>
  );
}

function FolderIcon() {
  return (
    <div className="absolute left-[26px] size-[44px] top-[21.5px]" data-name="Folder icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="Folder icon">
          <g id="Back main">
            <mask fill="white" id="path-1-inside-1_343_13271">
              <path d={svgPaths.p1ce9ae0} />
            </mask>
            <path d={svgPaths.p1ce9ae0} fill="var(--fill-0, #6941C6)" />
            <path d={svgPaths.p1c436000} fill="url(#paint0_linear_343_13271)" mask="url(#path-1-inside-1_343_13271)" />
          </g>
          <g id="Paper">
            <path d={svgPaths.pa611180} fill="var(--fill-0, white)" />
          </g>
          <rect fill="var(--fill-0, #7F56D9)" height="28.3333" id="Front main" rx="7.5" stroke="url(#paint1_linear_343_13271)" width="43" x="0.5" y="12.4167" />
          <rect fill="url(#paint2_linear_343_13271)" height="29.3333" id="Front gradient overlay" opacity="0.2" rx="8" width="44" y="11.9167" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_343_13271" x1="22" x2="22" y1="2.75" y2="41.25">
            <stop stopColor="white" stopOpacity="0.12" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_343_13271" x1="22" x2="22" y1="11.9167" y2="41.25">
            <stop stopColor="white" stopOpacity="0.12" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_343_13271" x1="0" x2="30.2586" y1="11.9167" y2="40.2623">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Content1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Content">
      <div className="content-stretch flex flex-col gap-[16px] items-start pt-[24px] px-[24px] relative w-full">
        <FeaturedIcon />
        <TextAndSupportingText />
        <InputWithLabel />
        <FolderIcon />
      </div>
    </div>
  );
}

function XClose() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="x-close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="x-close">
          <path d="M18 6L6 18M6 6L18 18" id="Icon" stroke="var(--stroke-0, #A4A7AE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonsButtonCloseX() {
  return (
    <div className="absolute content-stretch flex items-center justify-center overflow-clip p-[8px] right-[12px] rounded-[8px] size-[44px] top-[12px]" data-name="Buttons/Button close X">
      <XClose />
    </div>
  );
}

function ModalHeader() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[1016px]" data-name="_Modal header">
      <Content1 />
      <ButtonsButtonCloseX />
    </div>
  );
}

function ModalActions() {
  return <div className="content-stretch flex flex-col items-end pt-[32px] shrink-0 w-[714px]" data-name="_Modal actions" />;
}

export default function Modal() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center overflow-clip relative rounded-[16px] shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),0px_8px_8px_-4px_rgba(10,13,18,0.03),0px_3px_3px_-1.5px_rgba(10,13,18,0.04)] size-full" data-name="Modal">
      <BackgroundPatternDecorative />
      <ModalHeader />
      <ModalActions />
    </div>
  );
}