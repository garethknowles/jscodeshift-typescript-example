import type { Meta, StoryObj } from "@storybook/react";
import { CardsQueryStatusMock } from "~/common/hooks/graphql/Cards.query.mock";
import { mockCustomerProviderSupplier } from "~/common/testUtils/mockCustomerProvider";
import { ConnectionsWithAllAccountingProvidersConnectedQueryMock } from "~/features/connections/graphql/Connections.query.mock";
import {
  NoPotsQueryMock,
  PotsQueryMock,
} from "~/features/pots/graphql/pots.query.mock";
import { ProfileInfoQueryMock } from "~/features/profile/graphql/ProfileInfo.query.mock";
import { GetReferralCodeQueryMock } from "~/features/referrals/GetReferralCode/graphql/GetReferralCode.query.mock";
import { BannerType, CardStatus } from "~/graphql/types";
import { AppStoryComponent, defaultParameters } from "../AppStoryComponent";
import { withApolloMocks } from "../decorators/withApolloMocks";
import { withBannerMock } from "../decorators/withBannerMock";
import { withMockFeatures } from "../decorators/withMockFeatures";
import { withMockShare } from "../decorators/withMockShare";
import { withMockTrackingConsentProvider } from "../decorators/withMockTrackingConsentProvider";
import { withNavigateOnAppStart } from "../decorators/withNavigateOnAppStart";
import { withActiveUser } from "../decorators/withUser";
import { Payment3DsRequestTakeoverQueryMock } from "../graphql/Payment3DsRequestTakeover.query.mock";
import { FinCrimeFrozenQueryMock } from "~/features/cash-deposits/graphql/FinCrimeFrozen.query.mock";
import { mockGraphQL } from "~/../storybook/mocking/mockGraphQL";

const meta = {
  component: AppStoryComponent,
  beforeEach: [something, mockGraphQL([Payment3DsRequestTakeoverQueryMock()])],
  decorators: [
    withMockTrackingConsentProvider({ status: "complete" }),
    withActiveUser(),
    withMockShare()
  ],
  parameters: defaultParameters,
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const ActivateYourPendingCard = {
  decorators: [withUser(), decoratorReference, withFeaturesProvider()],
} satisfies Story;

export const GenieAllEnabled = {
  beforeEach: [mockGraphQL([FinCrimeFrozenQueryMock()])],
} satisfies Story;

export const GenieAllEnabledWithCustomerContext = {
  beforeEach: [mockGraphQL([FinCrimeFrozenQueryMock()])],

  args: {
    customerContext: mockCustomerProviderSupplier("GENIE")
  },


} satisfies Story;

export const GenieAllEnabledWithJustCustomerContext = {
  args: {
    customerContext: mockCustomerProviderSupplier("GENIE")
  },


} satisfies Story;

export const WithPotsAndInterestPot = {
  beforeEach: [mockGraphQL([
    TransfersInAndInterestPotTransactionsQueryMock(),
    PotsQueryMockWithInterestPot(),
    PotInterestRatesQueryMock(),
  ])],

  decorators: [withActiveUser({
    supplier: "GENIE",
  })],

  args: {
    storage_hasSeenPotIntroCarousel: "1",
    customerContext: mockCustomerProviderSupplier("GENIE")
  }
} satisfies Story;
