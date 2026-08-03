import { Shell } from "@/components/Shell";
import { IntakeForm } from "@/components/IntakeForm";

export default function IntakePage() {
 return (
 <Shell masthead="INTAKE">
 <div className="title-block">
 <p className="form-no">BS-03 COUNTER COPY</p>
 <h1>
 Cut a
 <br />
 buy sheet
 </h1>
 <p className="lede">
 Fail only what you saw. The stamp and ceiling update as you tick. Money does not leave
 the till above the line.
 </p>
 </div>
 <IntakeForm />
 </Shell>
 );
}
